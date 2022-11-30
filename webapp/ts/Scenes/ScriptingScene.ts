import { Container } from "pixi.js";
import { IScene, Manager } from "../Manager";
import { Draw } from "../model/Draw";
import * as nunjucks from "nunjucks";
import { DrawScene } from "./DrawScene";
import { Modal } from "bootstrap";
import * as monaco from 'monaco-editor';
import {EditorState} from "@codemirror/state"
import {EditorView, keymap} from "@codemirror/view"
import {defaultKeymap} from "@codemirror/commands"
import { basicSetup } from "codemirror";
import * as codemirrorLangs from "@codemirror/lang-javascript"
import {CodeJar} from 'codejar'
import hljs from "highlight.js";
import javascript from 'highlight.js/lib/languages/javascript';



export class ScriptingScene extends Container implements IScene {

    draw: Draw;
    constructor(draw: Draw) {
        super();
        this.draw = draw;
    }

    update(deltaMS: number): void {
        
    }

    init(): void {
        let actions = `
            <header style="display: flex; align-items:center; padding: 2px 0">
                <span style="display: flex; justify-content: center; width: 4em">Actions</span>
                <div class="bar btn-group btn-group-toggle">
                    <button type="button" class="modalling btn btn-light">Go Modalling</button>
                    <button type="button" class="show-json btn btn-light">Show JSON</button>
                </div>
            </header>
            <div>
                Scripting Editor:
                <div class="editor" id="editor"></div>
            </div>

            <div class="modal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                    <div class="modal-header">
                        <p class="modal-title">Schema JSON</p>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <pre>tables = {{ tables }}</pre>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                    </div>
                </div>
            </div>

        `;

        let html = nunjucks.renderString(actions, { tables: JSON.stringify(this.draw.schema.tables, null, 4) }); 
        document.querySelector(".scripting-container")!.innerHTML = html;
        let modalEl = document.querySelector(".modal")!
        let modal = new Modal(modalEl, {});
        document.querySelector('.modalling')?.addEventListener('click', () => {
            Manager.changeScene(new DrawScene(this.draw))
        })
        document.querySelector('.show-json')?.addEventListener('click', () => {
            modal.show();
        })


 
        // -------- codemirror 5 ---------
        // @ts-ignore
        var myCodeMirror = CodeMirror(document.body, {
            value: "function myScript(){return 100;}\n",
            mode:  "javascript",
            lineNumbers: true,
            gutter: true,
        });

/*          
        // -------- codemirror 6 ---------
        let startState = EditorState.create({
            doc: "// Hello World",
            extensions: keymap.of(defaultKeymap)
        })
        let view = new EditorView({
            state: startState,
            extensions: [basicSetup, codemirrorLangs.javascript()],
            parent: document.querySelector('.editor')!
        })
 */  
/*         
        let editor = monaco.editor.create(document.querySelector('.editor')!, {
            value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
            language: 'javascript'
        });
        console.log(editor.getValue()); 
 */
         
 
/*      
        // -------- CodeJar ---------
        hljs.registerLanguage("javascript", javascript);
    
        CodeJar(
            document.querySelector('.editor')!,
            hljs.highlightElement
        ) 
*/

/* 
        // -------- ace ---------
        //@ts-ignore
        var editor = ace.edit("editor");
        editor.setTheme("ace/theme/xcode");
        editor.session.setMode("ace/mode/javascript");
        editor.session.setTabSize(2);
        editor.session.setUseSoftTabs(true);
        editor.session.setUseWrapMode(true);
        console.log(editor.getValue());
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: false
        });
 */
    }

    destroyHtmlUi(): void {
        document.querySelector(".scripting-container")!.innerHTML = "";
    }
    
}