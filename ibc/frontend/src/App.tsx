import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  FileText,
  ChevronDown,
  Loader2,
  Home,
  AlertCircle,
} from "lucide-react";

// -- TYPE DEFINITIONS --
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
  versions: { [key: string]: { sections?: string[] } | "base" };
}
interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: [string, string][];
  placeholder: string;
  icon: React.ReactNode;
}

// -- HELPERS --
const versionFileMap = {
  "201611": "201611",
  "201711": "2017-11",
  "201806": "2018-06",
  "201908": "2019-08",
  "201912": "2019-12",
  "202006": "2020-06",
  "202104": "2021-04",
};
const versionLabels: { [k: string]: string } = {
  "201611": "Nov 2016",
  "201711": "Nov 2017",
  "201806": "Jun 2018",
  "201908": "Aug 2019",
  "201912": "Dec 2019",
  "202006": "Jun 2020",
  "202104": "Apr 2021",
};

function toFolderName(key: string): string {
  return key.replace(/-/g, "_");
}
function getVersionForSection(
  data: DataStructure | null,
  selectedVersion: string,
  sectionNumber: string
) {
  if (selectedVersion === "201611") return "201611";
  const versionData = data?.versions[selectedVersion];
  if (
    versionData &&
    typeof versionData === "object" &&
    "sections" in versionData &&
    Array.isArray(versionData.sections)
  ) {
    if ((versionData.sections as string[]).includes(sectionNumber)) {
      return selectedVersion;
    }
  }
  return "201611";
}
const renderMarkdown = (text: string) => {
  if (!text) return "";
  // basic markdown formatting
  return text
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-gray-800">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 text-gray-800">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2 text-gray-800">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^-\s(.*$)/gm, '<li class="ml-4">• $1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700">')
    .replace(/^(?!<[h|l|s])/gm, '<p class="mb-4 text-gray-700">')
    .replace(/(?<![>])$/gm, '</p>');
};

const SimpleDiffViewer: React.FC<{
  oldValue: string;
  newValue: string;
  currentVersion: string;
}> = ({ oldValue, newValue, currentVersion }) => {
  const [viewMode, setViewMode] = useState<"side-by-side" | "unified">("side-by-side");
  const oldLines = oldValue.split("\n");
  const newLines = newValue.split("\n");

  const getDiffLines = () => {
    const maxLength = Math.max(oldLines.length, newLines.length);
    const diffLines = [];
    for (let i = 0; i < maxLength; i++) {
      const oldLine = oldLines[i] || "";
      const newLine = newLines[i] || "";
      if (oldLine === newLine) {
        diffLines.push({ type: "equal", oldLine, newLine, lineNum: i + 1 });
      } else if (!oldLine) {
        diffLines.push({ type: "added", oldLine: "", newLine, lineNum: i + 1 });
      } else if (!newLine) {
        diffLines.push({ type: "removed", oldLine, newLine: "", lineNum: i + 1 });
      } else {
        diffLines.push({ type: "modified", oldLine, newLine, lineNum: i + 1 });
      }
    }
    return diffLines;
  };

  const diffLines = getDiffLines();
  if (viewMode === "side-by-side") {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
          <h4 className="font-medium text-gray-800">Comparison View</h4>
          <div className="flex gap-2">
            <button onClick={() => setViewMode("side-by-side")}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === "side-by-side" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}>
              Side by Side
            </button>
            <button onClick={() => setViewMode("unified")}
              className={`px-3 py-1 text-sm rounded ${
                (viewMode as "side-by-side" | "unified") === "unified" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}>
              Unified
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x">
          <div className="p-4">
            <h5 className="font-medium text-gray-800 mb-3 pb-2 border-b">Base Version (Nov 2016)</h5>
            <div className="text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(oldValue) }} />
          </div>
          <div className="p-4">
            <h5 className="font-medium text-gray-800 mb-3 pb-2 border-b">Current Version ({versionLabels[currentVersion]})</h5>
            <div className="text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(newValue) }} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
        <h4 className="font-medium text-gray-800">Comparison View</h4>
        <div className="flex gap-2">
          <button onClick={() => setViewMode("side-by-side")}
            className={`px-3 py-1 text-sm rounded ${(viewMode as "side-by-side" | "unified") === "side-by-side" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
            Side by Side
          </button>
          <button onClick={() => setViewMode("unified")}
            className={`px-3 py-1 text-sm rounded ${(viewMode as "side-by-side" | "unified") === "unified" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
            Unified
          </button>
        </div>
      </div>
      <div className="p-4 max-h-96 overflow-y-auto">
        {diffLines.map((line, i) => (
          <div key={i} className={`flex text-sm font-mono leading-relaxed ${
            line.type === "added" ? "bg-green-50" :
            line.type === "removed" ? "bg-red-50" :
            line.type === "modified" ? "bg-yellow-50" : ""}`}>
            <span className="w-12 text-gray-500 text-right pr-3 select-none">{line.lineNum}</span>
            <span className={`flex-1 px-2 ${
              line.type === "added" ? "text-green-800" :
              line.type === "removed" ? "text-red-800" :
              line.type === "modified" ? "text-yellow-800" : "text-gray-700"
            }`}>
              {line.type === "removed" && "- "}
              {line.type === "added" && "+ "}
              {line.type === "modified" && "~ "}
              {line.newLine || line.oldLine}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [data, setData] = useState<DataStructure | null>(null);
  const [selectedPart, setSelectedPart] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [sections, setSections] = useState<string[]>([]);
  const [currentVersion, setCurrentVersion] = useState("201611");
  const [content, setContent] = useState("");
  const [baseContent, setBaseContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [baseLoading, setBaseLoading] = useState(false);

  useEffect(() => {
    fetch("/law_hierarchy.json")
      .then((res) => res.json())
      .then((fetchedData: DataStructure) => {
        setData(fetchedData);
        setInitialLoading(false);
      })
      .catch(() => setInitialLoading(false));
  }, []);
  useEffect(() => {
    if (!data || !selectedPart) {
      setSections([]);
      setSelectedChapter("");
      setSelectedSection("");
      return;
    }
    const part = data.parts[selectedPart];
    if (!part) {
      setSections([]);
      setSelectedChapter("");
      setSelectedSection("");
      return;
    }
    if (part.chapters.length > 0) {
      setSections([]);
      setSelectedChapter("");
      setSelectedSection("");
    } else if (part.defaultSections && part.defaultSections.length > 0) {
      setSections(part.defaultSections);
      setSelectedChapter("default");
      setSelectedSection("");
    } else {
      setSections([]);
      setSelectedChapter("");
      setSelectedSection("");
    }
  }, [selectedPart, data]);
  useEffect(() => {
    setSelectedSection("");
    if (!data || !selectedPart || !selectedChapter) {
      setSections([]);
      return;
    }
    const part = data.parts[selectedPart];
    let newSections: string[] = [];
    if (selectedChapter === "default") {
      newSections = part.defaultSections || [];
    } else {
      const chapter = part.chapters.find(
        (c: Chapter) => c.key === selectedChapter
      );
      newSections = chapter ? chapter.sections : [];
    }
    setSections(newSections);
  }, [selectedChapter, selectedPart, data]);
  useEffect(() => {
    setShowDiff(false);
    if (
      !selectedPart ||
      !selectedChapter ||
      !selectedSection ||
      !sections.length ||
      !sections.includes(selectedSection)
    ) {
      setContent("");
      return;
    }
    const controller = new AbortController();
    const signal = controller.signal;
    setLoading(true);
    const effectiveVersion = getVersionForSection(
      data,
      currentVersion,
      selectedSection
    );
    const effectiveVersionSuffix =
      versionFileMap[effectiveVersion as keyof typeof versionFileMap];
    let path = `/content/${toFolderName(selectedPart)}`;
    if (selectedChapter !== "default") {
      path += `/${toFolderName(selectedChapter)}`;
    }
    const sectionPrefix =
      selectedPart === "schedules" ? "schedule" : "section";
    path += `/${sectionPrefix}${selectedSection}_${effectiveVersionSuffix}.md`;
    fetch(path, { signal, headers: { Accept: "text/markdown" } })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.text();
      })
      .then((markdown) => {
        if (!signal.aborted) {
          setContent(markdown || "");
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
    return () => {
      controller.abort();
    };
  }, [selectedPart, selectedChapter, selectedSection, currentVersion, sections, data]);
  useEffect(() => {
    if (!(showDiff && selectedPart && selectedChapter && selectedSection)) {
      setBaseContent("");
      setBaseLoading(false);
      return;
    }
    setBaseLoading(true);
    let basePath = `/content/${toFolderName(selectedPart)}`;
    if (selectedChapter !== "default") {
      basePath += `/${toFolderName(selectedChapter)}`;
    }
    const sectionPrefix =
      selectedPart === "schedules" ? "schedule" : "section";
    basePath += `/${sectionPrefix}${selectedSection}_201611.md`;
    fetch(basePath, { headers: { Accept: "text/markdown" } })
      .then((res) => res.ok ? res.text() : "")
      .then((markdown) => {
        setBaseContent(markdown || "");
        setBaseLoading(false);
      })
      .catch(() => setBaseLoading(false));
  }, [showDiff, selectedPart, selectedChapter, selectedSection]);

  const isAmended =
    currentVersion !== "201611" &&
    data &&
    typeof data.versions[currentVersion] === "object" &&
    Array.isArray((data.versions[currentVersion] as { sections?: string[] }).sections) &&
    ((data.versions[currentVersion] as { sections?: string[] }).sections || []).includes(selectedSection);

  const CustomSelect: React.FC<SelectProps> = ({
    value,
    onChange,
    options,
    placeholder,
    icon,
  }) => (
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
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
    </div>
  );

  if (initialLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-gray-600 mx-auto" />
      </div>
    );
  if (showLanding)
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
                Track all amendments in the Insolvency and Bankruptcy Code. 
                Select sections and compare their evolution over time.
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
                    Browse different parts, chapters, and sections of the IBC
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Track Changes
                  </h3>
                  <p className="text-sm text-gray-600">
                    Compare content across {Object.keys(versionLabels).length} versions (2016-2021)
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
  if (!data)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h2 className="text-lg font-medium text-gray-800 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600">Could not fetch law_hierarchy.json</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="w-full px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">IBC Version Tracker</h1>
            <p className="text-sm text-gray-600">
              Insolvency and Bankruptcy Code Explorer
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLanding(true)}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center transition-colors mr-2"
              title="Back to Home"
            >
              <Home className="w-4 h-4 mr-1" /> Home
            </button>
            <button
              onClick={() => setShowDebug((prev) => !prev)}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center"
            >
              <AlertCircle className="w-4 h-4 mr-1" /> Debug
            </button>
          </div>
        </div>
      </header>
      <div className="w-full px-6 py-6">
        {showDebug && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
            <h3 className="font-medium text-yellow-800 mb-2">Debug Info</h3>
            <p>
              <strong>Part:</strong> {selectedPart || "None"}, <strong>Chapter:</strong> {selectedChapter || "None"}, <strong>Section:</strong> {selectedSection || "None"}
            </p>
            <p>
              <strong>Available Sections:</strong> [{sections.join(", ")}]
            </p>
            <p>
              <strong>Current Version:</strong> {currentVersion}
            </p>
            <p>
              <strong>Is Amended:</strong> {isAmended ? "Yes" : "No"}
            </p>
            <p>
              <strong>Show Diff:</strong> {showDiff ? "Yes" : "No"}
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 h-fit">
              <h2 className="text-lg font-medium text-gray-800 flex items-center mb-4">
                <BookOpen className="w-5 h-5 mr-2 text-gray-600" />
                Navigation
              </h2>
              <CustomSelect
                value={selectedPart}
                onChange={(e) => setSelectedPart(e.target.value)}
                options={Object.entries(data.parts).map(([key, part]) => [
                  key,
                  part.name,
                ])}
                placeholder="Choose Part"
                icon={<BookOpen className="w-4 h-4" />}
              />
              {selectedPart &&
                data.parts[selectedPart]?.chapters &&
                data.parts[selectedPart].chapters.length > 0 && (
                  <CustomSelect
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    options={data.parts[selectedPart].chapters.map((c) => [
                      c.key,
                      c.name,
                    ])}
                    placeholder="Choose Chapter"
                    icon={<FileText className="w-4 h-4" />}
                  />
                )}
              {sections.length > 0 && (
                <CustomSelect
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  options={sections.map((s) => [
                    s,
                    selectedPart === "schedules"
                      ? `Schedule ${s}`
                      : `Section ${s}`,
                  ])}
                  placeholder={
                    selectedPart === "schedules"
                      ? "Choose Schedule"
                      : "Choose Section"
                  }
                  icon={<FileText className="w-4 h-4" />}
                />
              )}
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
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {/* Content Display */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-96 p-6">
              {/* Info and Diff Button */}
              {selectedSection && content && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="text-blue-800">
                      Section {selectedSection} - Version: {getVersionForSection(data, currentVersion, selectedSection)}
                      {isAmended ? (
                        <span className="ml-2 text-blue-600 font-medium">
                          (Amended in {versionLabels[currentVersion]})
                        </span>
                      ) : (
                        <span className="ml-2 text-blue-600 font-medium">
                          (Not amended in {versionLabels[currentVersion]}, showing base content)
                        </span>
                      )}
                    </span>
                    {isAmended && !showDiff && (
                      <button
                        className="ml-auto bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700 transition-colors text-xs font-semibold"
                        onClick={() => setShowDiff(true)}
                      >
                        Check Differences
                      </button>
                    )}
                  </div>
                </div>
              )}
              {/* Diff Viewer */}
              {showDiff ? (
                <>
                  {baseLoading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-600">Loading base version for comparison...</p>
                    </div>
                  ) : (
                    <SimpleDiffViewer oldValue={baseContent} newValue={content} currentVersion={currentVersion} />
                  )}
                  <button
                    className="mt-4 text-blue-700 underline text-sm"
                    onClick={() => setShowDiff(false)}
                  >
                    Close Differences
                  </button>
                </>
              ) : loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-600">Loading content...</p>
                </div>
              ) : content ? (
                <div
                  id="dynamic-content"
                  className="p-6 prose max-w-none prose-gray prose-headings:text-gray-800 prose-p:text-gray-700"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                />
              ) : (
                <div className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    Welcome to IBC Tracker
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Select a part, chapter (if applicable), section, and version to view content.
                  </p>
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
