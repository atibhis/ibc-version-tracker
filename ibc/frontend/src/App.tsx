import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen, Calendar, FileText, ChevronDown, Loader2, Home, AlertCircle } from "lucide-react";

// Type definitions to fix TypeScript errors
interface Chapter {
  key: string;
  name: string;
  sections: string[];
}

interface Part {
  name: string;
  chapters: Chapter[];
  defaultSections?: string[];
}

interface DataStructure {
  laws: { [key: string]: string };
  parts: { [key: string]: Part };
  versions: { [key: string]: unknown };
}

interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: [string, string][];
  placeholder: string;
  icon: React.ReactNode;
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [data, setData] = useState<DataStructure | null>(null);
  const [selectedPart, setSelectedPart] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [sections, setSections] = useState<string[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>("201611");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [showDebug, setShowDebug] = useState<boolean>(false);

  // Fetch law_hierarchy.json at runtime
  useEffect(() => {
    fetch("/law_hierarchy.json")
      .then(res => res.json())
      .then(fetchedData => {
        setData(fetchedData);
        setInitialLoading(false);
        console.log("Loaded data:", fetchedData);
      })
      .catch(err => {
        console.error("Failed to load law_hierarchy.json", err);
        setInitialLoading(false);
      });
  }, []);

  // Update sections when part changes
  // Update sections when part changes
  useEffect(() => {
    if (!data || !selectedPart) {
      setSections([]);
      setSelectedSection("");
      setSelectedChapter("");
      return;
    }

    const part = data.parts[selectedPart];

    if (!part) {
      setSections([]);
      setSelectedSection("");
      setSelectedChapter("");
      return;
    }

    if (part.chapters && Array.isArray(part.chapters) && part.chapters.length > 0) {
      setSections([]);
      setSelectedChapter(part.chapters[0].key); // auto-select first chapter
      // Do not set section here, will be set in "chapter change" useEffect
      setSelectedSection(""); // reset section so old value is never reused
    } else if (part.defaultSections && Array.isArray(part.defaultSections) && part.defaultSections.length > 0) {
      setSections(part.defaultSections);
      setSelectedChapter("default");
      setSelectedSection(part.defaultSections[0]); // always pick first section
    } else {
      setSections([]);
      setSelectedChapter("");
      setSelectedSection("");
        }
      }, [selectedPart, data]);


  // Update sections when chapter changes
  useEffect(() => {
  if (!data || !selectedPart || !selectedChapter) {
    setSections([]);
    setSelectedSection(""); // always reset
    setDebugInfo(`Missing: data=${!!data}, selectedPart=${selectedPart}, selectedChapter=${selectedChapter}`);
    return;
  }

  const part = data.parts[selectedPart];
  let newSections: string[] = [];

  if (selectedChapter === "default") {
    newSections = part.defaultSections || [];
  } else {
    const chapter = part.chapters.find((c: Chapter) => c.key === selectedChapter);
    newSections = chapter ? chapter.sections : [];
  }

  setSections(newSections);

  // Always reset to the first section of the new chapter/part
  setSelectedSection(newSections.length > 0 ? newSections[0] : "");

  setDebugInfo(`Part: ${selectedPart}, Chapter: ${selectedChapter}, Sections: ${newSections.length}`);
    }, [selectedChapter, selectedPart, data]);


  // Load markdown dynamically
  useEffect(() => {
    if (!selectedPart || !selectedSection || !currentVersion) {
      setContent("");
      setDebugInfo("Missing selection parameters");
      return;
    }

    setLoading(true);
    
    const versionFileMap = {
      "201611": "201611",
      "201711": "2017-11",
      "201806": "2018-06", 
      "201908": "2019-08",
      "201912": "2019-12",
      "202006": "2020-06",
      "202104": "2021-04"
    };

    function toFolderName(key: string): string {
      return key.replace(/-/g, "_");
    }

    let path = `/content/${toFolderName(selectedPart)}`;

    
    // Add chapter to path if it exists and is not default
    if (
        selectedChapter &&
        selectedChapter !== "default" &&
        selectedPart &&
        data?.parts[selectedPart] &&
        data.parts[selectedPart].chapters &&
        data.parts[selectedPart].chapters.length > 0
      ) {
        path += `/${toFolderName(selectedChapter)}`;
      }

    // Handle schedules differently - they use "Schedule X" instead of "Section X"
    const sectionPrefix = selectedPart === "schedules" ? "schedule" : "section";
    path += `/${sectionPrefix}${selectedSection}_${versionFileMap[currentVersion as keyof typeof versionFileMap]}.md`;

    console.log("Attempting to fetch:", path);
    setDebugInfo(`Fetching: ${path}`);

    fetch(path)
      .then(res => {
        console.log("Fetch response:", res.status, res.statusText);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText} for ${path}`);
        }
        return res.text();
      })
      .then(markdown => {
        console.log("Successfully loaded content, length:", markdown.length);
        setContent(markdown);
        setLoading(false);
        setDebugInfo(`Successfully loaded: ${path}`);
      })
      .catch(err => {
        console.error("Error loading content:", err.message);
        const errorContent = `# Content Not Available\n\nUnable to load content for ${selectedPart === "schedules" ? "Schedule" : "Section"} ${selectedSection}.\n\n**Error:** ${err.message}\n\n**Path attempted:** ${path}\n\n**Debug Info:**\n- Part: ${selectedPart}\n- Chapter: ${selectedChapter}\n- Section: ${selectedSection}\n- Version: ${currentVersion}`;
        setContent(errorContent);
        setDebugInfo(`Error: ${err.message}`);
        setLoading(false);
      });
  }, [selectedPart, selectedChapter, selectedSection, currentVersion, data]);

  const CustomSelect: React.FC<SelectProps> = ({ value, onChange, options, placeholder, icon }) => (
    <div className="relative mb-3">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
        {icon}
      </div>
      <select
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:border-gray-500 focus:outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
    </div>
  );

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-lg shadow-md">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto mb-3" />
          <h2 className="text-lg font-medium text-gray-800">Loading IBC Tracker...</h2>
          <p className="text-gray-600 text-sm">Fetching law hierarchy data</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h2 className="text-lg font-medium text-gray-800 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600">Could not fetch law_hierarchy.json</p>
        </div>
      </div>
    );
  }

  const versionLabels = {
    "201611": "Nov 2016",
    "201711": "Nov 2017", 
    "201806": "Jun 2018",
    "201908": "Aug 2019",
    "201912": "Dec 2019",
    "202006": "Jun 2020",
    "202104": "Apr 2021"
  };

  // Landing Page Component
  if (showLanding) {
    return (
      <div className="h-screen w-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <div className="mb-6">
              <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                IBC Version Tracker
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Insolvency and Bankruptcy Code Explorer
              </p>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                Track changes in the Insolvency and Bankruptcy Code across different amendments. 
                Compare versions, explore sections, and understand how the law has evolved over time.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Navigate Sections
                  </h3>
                  <p className="text-sm text-gray-600">
                    Browse through different parts, chapters, and sections of the IBC
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Track Changes
                  </h3>
                  <p className="text-sm text-gray-600">
                    Compare content across {Object.keys(versionLabels).length} different versions from 2016-2021
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowLanding(false)}
                className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Start Exploring
              </button>

              <div className="text-sm text-gray-500">
                <p>Available versions: {Object.values(versionLabels).join(' • ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="w-full px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                IBC Version Tracker
              </h1>
              <p className="text-sm text-gray-600">Insolvency and Bankruptcy Code Explorer</p>
            </div>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center"
            >
              <AlertCircle className="w-4 h-4 mr-1" />
              Debug
            </button>
          </div>
        </div>
      </header>

      <div className="w-full px-6 py-6">
        {/* Debug Panel */}
        {showDebug && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">Debug Information</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p><strong>Current Selection:</strong> Part: {selectedPart || 'None'}, Chapter: {selectedChapter || 'None'}, Section: {selectedSection || 'None'}</p>
              <p><strong>Available Sections:</strong> [{sections.join(', ')}]</p>
              <p><strong>Debug Info:</strong> {debugInfo}</p>
              <button
                onClick={() => console.log("Full data structure:", JSON.stringify(data, null, 2))}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm mr-2"
              >
                Log Full Data
              </button>
              {selectedPart && data?.parts[selectedPart] && (
                <div>
                  <p><strong>Part Structure:</strong></p>
                  <pre className="bg-yellow-100 p-2 rounded mt-1 text-xs overflow-auto">
                    {JSON.stringify(data.parts[selectedPart], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 h-fit">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-800 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-gray-600" />
                  Navigation
                </h2>
                <button
                  onClick={() => setShowLanding(true)}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center"
                  title="Back to Home"
                >
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </button>
              </div>
              
              <div>
                <CustomSelect
                  value={selectedPart}
                  onChange={(e) => setSelectedPart(e.target.value)}
                  options={Object.entries(data.parts).map(([key, part]) => [key, part.name])}
                  placeholder="Choose Part"
                  icon={<BookOpen className="w-4 h-4" />}
                />

                {selectedPart && data.parts[selectedPart]?.chapters && data.parts[selectedPart].chapters.length > 0 && (
                  <CustomSelect
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    options={data.parts[selectedPart].chapters.map((c: Chapter) => [c.key, c.name])}
                    placeholder="Choose Chapter"
                    icon={<FileText className="w-4 h-4" />}
                  />
                )}

                {sections.length > 0 && (
                  <CustomSelect
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    options={sections.map(s => [s, selectedPart === "schedules" ? `Schedule ${s}` : `Section ${s}`])}
                    placeholder={selectedPart === "schedules" ? "Choose Schedule" : "Choose Section"}
                    icon={<FileText className="w-4 h-4" />}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Version Selector */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center mb-4">
                <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                <h2 className="text-lg font-medium text-gray-800">Versions</h2>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {Object.entries(versionLabels).map(([version, label]) => (
                  <button
                    key={version}
                    onClick={() => setCurrentVersion(version)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      currentVersion === version
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Display */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-96">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-600">Loading content...</p>
                </div>
              ) : content ? (
                <div id="dynamic-content" className="p-6 prose max-w-none prose-gray prose-headings:text-gray-800 prose-p:text-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-800 mb-2">Welcome to IBC Tracker</h3>
                  <p className="text-gray-600 mb-6">Select a part, chapter (if applicable), section, and version to view content.</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>• Navigate through the IBC structure using the sidebar</p>
                    <p>• Select different versions to track changes over time</p>
                    <p>• View detailed section content and amendments</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
