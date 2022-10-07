import React from "react";

import TranscriptEditor from "../packages/components/transcript-editor";
import SttTypeSelect from "./select-stt-json-type";
import ExportFormatSelect from "./select-export-format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import {
  loadLocalSavedData,
  isPresentInLocalStorage,
  localSave
} from "./local-storage.js";

import DEMO_TRANSCRIPT from "./sample-data/1speaker.json";
const DEMO_MEDIA_URL = //"https://rr3---sn-8pxuuxa-nbo6l.googlevideo.com/videoplayback?expire=1665149956&ei=pNc_Y_O6KK-1ir4P3L-MoAw&ip=181.214.165.230&id=o-AAKUBFVETd-NR6onOHcIkn2vCvLChenr8MmP4sGGPqfA&itag=18&source=youtube&requiressl=yes&spc=yR2vpzUxBtOetWQ8f9FshsrSbhdsHew&vprv=1&mime=video%2Fmp4&ns=Xr2xDYMn0yOvTh0REuj6GWwI&gir=yes&clen=42353889&ratebypass=yes&dur=564.992&lmt=1649114342116256&fexp=24001373,24007246&c=WEB&txp=4530434&n=8vcgoqTkSpQrfw&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cspc%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cratebypass%2Cdur%2Clmt&sig=AOq0QJ8wRgIhAKYTkqSkKsLRW-NBLxeYp9siKaUyldcbfKCCt40AQgl7AiEA-3etW8jpFeECaMdmFhxdkHjJKBXamUN6HGZgmpwNWm0%3D&rm=sn-vgqeek7s&req_id=afc4571fa328a3ee&ipbypass=yes&redirect_counter=2&cm2rm=sn-8pxuuxa-83be7d&cms_redirect=yes&cmsv=e&mh=m7&mip=115.75.163.183&mm=29&mn=sn-8pxuuxa-nbo6l&ms=rdu&mt=1665127987&mv=m&mvi=3&pl=22&lsparams=ipbypass,mh,mip,mm,mn,ms,mv,mvi,pl&lsig=AG3C_xAwRAIgXXrVWJNgbIL40MI94Hqmqmp3nVp8P6bOhcih7hbcvbkCIG5F5hW7GiOghSUYhM4QWIE-G9hXVPxSy159RWWXQgai"
  "https://download.ted.com/talks/KateDarling_2018S-950k.mp4";
const DEMO_TITLE =
  "TED Talk | Kate Darling - Why we have an emotional connection to robots";

import style from "./index.module.scss";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      transcriptData: null,
      mediaUrl: null,
      isTextEditable: true,
      spellCheck: false,
      sttType: "amazontranscribe",
      analyticsEvents: [],
      title: "",
      fileName: "",
      autoSaveData: {},
      autoSaveContentType: "draftjs",
      autoSaveExtension: "json"
    };

    this.transcriptEditorRef = React.createRef();
  }

  loadDemo = () => {
    if(isPresentInLocalStorage(DEMO_MEDIA_URL)){
      const transcriptDataFromLocalStorage = loadLocalSavedData(DEMO_MEDIA_URL)
      this.setState({
        transcriptData: transcriptDataFromLocalStorage,
        mediaUrl: DEMO_MEDIA_URL,
        title: DEMO_TITLE,
        sttType: 'draftjs'
      });
    }
    else{
       this.setState({
        transcriptData: DEMO_TRANSCRIPT,
        mediaUrl: DEMO_MEDIA_URL,
        title: DEMO_TITLE,
        sttType: "amazontranscribe"
      });
    }
   
  };

  // https://stackoverflow.com/questions/8885701/play-local-hard-drive-video-file-with-html5-video-tag
  handleLoadMedia = files => {
    const file = files[0];
    const videoNode = document.createElement("video");
    const canPlay = videoNode.canPlayType(file.type);

    if (canPlay) {
      const fileURL = URL.createObjectURL(file);
      this.setState({
        // transcriptData: DEMO_TRANSCRIPT,
        mediaUrl: fileURL,
        fileName: file.name
      });
    } else {
      alert("Select a valid audio or video file.");
    }
  };

  handleLoadMediaUrl = () => {
    const fileURL = prompt("Paste the URL you'd like to use here:");

    this.setState({
      // transcriptData: DEMO_TRANSCRIPT,
      mediaUrl: fileURL
    });
  };

  handleLoadTranscriptJson = files => {
    const file = files[0];

    if (file.type === "application/json") {
      const fileReader = new FileReader();

      fileReader.onload = event => {
        this.setState({
          transcriptData: JSON.parse(event.target.result)
        });
      };

      fileReader.readAsText(file);
    } else {
      alert("Select a valid JSON file.");
    }
  };

  handleIsTextEditable = e => {
    this.setState({
      isTextEditable: e.target.checked
    });
  };

  handleSpellCheck = e => {
    this.setState({
      spellCheck: e.target.checked
    });
  };

  // https://stackoverflow.com/questions/21733847/react-jsx-selecting-selected-on-selected-select-option
  handleSttTypeChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleExportFormatChange = event => {
    console.log(event.target.name, event.target.value);
    this.setState({ [event.target.name]: event.target.value });
  };

  exportTranscript = () => {
    console.log("export");
    // eslint-disable-next-line react/no-string-refs
    const { data, ext } = this.transcriptEditorRef.current.getEditorContent(
      this.state.exportFormat
    );
    let tmpData = data;
    if (ext === "json") {
      tmpData = JSON.stringify(data, null, 2);
    }
    if (ext !== "docx") {
      this.download(tmpData, `${this.state.mediaUrl}.${ext}`);
    }
  };

  // https://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
  download = (content, filename, contentType) => {
    console.log("download");
    const type = contentType || "application/octet-stream";
    const link = document.createElement("a");
    const blob = new Blob([content], { type: type });

    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    // Firefox fix - cannot do link.click() if it's not attached to DOM in firefox
    // https://stackoverflow.com/questions/32225904/programmatical-click-on-a-tag-not-working-in-firefox
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  clearLocalStorage = () => {
    localStorage.clear();
    console.info("Cleared local storage.");
  };

  handleAnalyticsEvents = event => {
    this.setState({ analyticsEvents: [...this.state.analyticsEvents, event] });
  };

  handleChangeTranscriptTitle = newTitle => {
    this.setState({
      title: newTitle
    });
  };

  handleChangeTranscriptName = value => {
    this.setState({ fileName: value });
  };

  handleAutoSaveChanges = newAutoSaveData => {
    console.log("handleAutoSaveChanges", newAutoSaveData);
    const { data, ext } = newAutoSaveData;
    this.setState({ autoSaveData: data, autoSaveExtension: ext });
    // Saving to local storage 
    localSave(this.state.mediaUrl, this.state.fileName, data);
  };
  render() {
    return (
      <div className={style.container}>
        <span>React Transcript Editor Demo </span>
        <a
          href="https://github.com/bbc/react-transcript-editor"
          rel="noopener noreferrer"
          target="_blank"
        >
          <FontAwesomeIcon icon={faGithub} />
        </a>
        <div className={style.demoNav}>
          <section className={style.demoNavItem}>
            <label className={style.sectionLabel}>Start</label>
            <button
              className={style.demoButton}
              onClick={() => this.loadDemo()}
            >
              Load Demo
            </button>
          </section>

          <section className={style.demoNavItem}>
            <label className={style.sectionLabel}>Load Media</label>
            <button onClick={() => this.handleLoadMediaUrl()}> From URL</button>
            <input
              type={"file"}
              id={"mediaFile"}
              onChange={e => this.handleLoadMedia(e.target.files)}
            />
            <label htmlFor="mediaFile">From Computer</label>
            {this.state.fileName !== "" ? (
              <label className={style.fileNameLabel}>
                {this.state.fileName}
              </label>
            ) : null}
          </section>

          <section className={style.demoNavItem}>
            <label className={style.sectionLabel}>Load Transcript</label>
            <SttTypeSelect
              className={style.dropdown}
              name={"sttType"}
              value={this.state.sttType}
              handleChange={this.handleSttTypeChange}
            />

            <input
              type={"file"}
              id={"transcriptFile"}
              onChange={e => this.handleLoadTranscriptJson(e.target.files)}
            />
            <label htmlFor="transcriptFile">From Computer</label>
            {this.state.transcriptData !== null ? (
              <label className={style.fileNameLabel}>Transcript loaded.</label>
            ) : null}
          </section>

          <section className={style.demoNavItem}>
            <label className={style.sectionLabel}>Export Transcript</label>
            <ExportFormatSelect
              className={style.dropdown}
              name={"exportFormat"}
              value={this.state.exportFormat}
              handleChange={this.handleExportFormatChange}
            />
            <button onClick={() => this.exportTranscript()}>Export File</button>
          </section>

          <section className={style.demoNavItem}>
            <label className={style.sectionLabel}>
              Transcript Title
              <span className={style.titleLabel}>(Optional)</span>
            </label>
            <input
              type="text"
              value={this.state.title}
              onChange={e => this.handleChangeTranscriptTitle(e.target.value)}
            />
          </section>

          <section className={style.demoNavItem}>
            <label className={style.sectionLabel}>Options</label>

            <div className={style.checkbox}>
              <label
                className={style.editableLabel}
                htmlFor={"textIsEditableCheckbox"}
              >
                Text Is Editable
              </label>
              <input
                id={"textIsEditableCheckbox"}
                type="checkbox"
                checked={this.state.isTextEditable}
                onChange={this.handleIsTextEditable}
              />
            </div>

            <div className={style.checkbox}>
              <label
                className={style.editableLabel}
                htmlFor={"spellCheckCheckbox"}
              >
                Spell Check
              </label>
              <input
                id={"spellCheckCheckbox"}
                type="checkbox"
                checked={this.state.spellCheck}
                onChange={this.handleSpellCheck}
              />
            </div>

            <button
              className={style.warningButton}
              onClick={() => this.clearLocalStorage()}
            >
              Clear Local Storage
            </button>
          </section>
        </div>

        <TranscriptEditor
          transcriptData={this.state.transcriptData}
          fileName={this.state.fileName}
          mediaUrl={this.state.mediaUrl}
          isEditable={this.state.isTextEditable}
          spellCheck={this.state.spellCheck}
          sttJsonType={this.state.sttType}
          handleAnalyticsEvents={this.handleAnalyticsEvents}
          title={this.state.title}
          ref={this.transcriptEditorRef}
          handleAutoSaveChanges={this.handleAutoSaveChanges}
          autoSaveContentType={this.state.autoSaveContentType}
          mediaType={ 'video' }
        />

        {/* <section style={{ height: "250px", width: "50%", float: "left" }}>
          <h3>Components Analytics</h3>
          <textarea
            style={{ height: "100%", width: "100%" }}
            value={JSON.stringify(this.state.analyticsEvents, null, 2)}
            disabled
          />
        </section>

        <section style={{ height: "250px", width: "50%", float: "right" }}>
          <h3>
            Auto Save data:{" "}
            <code>
              {this.state.autoSaveContentType}| {this.state.autoSaveExtension}
            </code>
          </h3>
          <textarea
            style={{ height: "100%", width: "100%" }}
            value={
              this.state.autoSaveExtension === "json"
                ? JSON.stringify(this.state.autoSaveData, null, 2)
                : this.state.autoSaveData
            }
            disabled
          />
        </section> */}
      </div>
    );
  }
}

export default App;