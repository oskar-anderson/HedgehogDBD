import { Container } from "pixi.js";
import * as PIXI from "pixi.js";
import { IScene, Manager } from "../Manager";
import { Draw } from "../model/Draw";
import * as nunjucks from "nunjucks";
import { DrawScene } from "./DrawScene";
import { Modal } from "bootstrap";
import * as monaco from 'monaco-editor';
import { LocalStorageData, Script } from "../model/LocalStorageData";
import dayjs from "dayjs";  // used in scripts

export class ScriptingScene extends Container implements IScene {

    editorValue: string = "";
    draw: Draw;
    constructor(draw: Draw) {
        super();
        this.draw = draw;
    }

    update(deltaMS: number): void {
        
    }

    async init(): Promise<void> {
        let actions = `
            <header style="display: flex; align-items:center; padding: 2px 0">
                <span style="display: flex; justify-content: center; width: 4em">Actions</span>
                <div class="bar btn-group btn-group-toggle">
                    <button type="button" class="modalling btn btn-light">Go Modalling</button>
                    <button type="button" class="show-json btn btn-light">Show JSON</button>
                </div>
            </header>
            <div>
                <div class="mt-4 mx-2">
                    <div class="h4">Scripts</div>
                    <div class="row">
                        <div class="col-sm-6">
                            <div class="h5">
                                Builtin
                            </div>
                            <ul class="list-group">
                            {% for script in builtinScripts %}
                                <li class="script-modal list-group-item" data-content="{{ script.content }}" data-name="{{ script.name }}" data-islocalstoragescript="N">
                                    <span>{{ script.name }}</span>
                                </li>
                            {% endfor %}
                            </ul>
                        </div>
                        <div class="col-sm-6">
                            <div class="h5">
                                LocalStorage
                            </div>
                            <ul class="list-group">
                            {% for script in localStorageScripts %}
                                <li class="script-modal list-group-item" data-content="{{ script.content }}" data-name="{{ script.name }}" data-islocalstoragescript="Y">
                                    <span>{{ script.name }}</span>
                                </li>
                            {% endfor %}
                            </ul>
                        </div>  
                    </div>
                </div>

                <div class="mt-4 mx-2">
                    <div class="h4">Editor</div>
                    <div>
                        <button type="button" class="save-btn btn btn-light">Save</button>
                        <button type="button" class="execute-btn btn btn-light">Execute</button>
                    </div>
                    
                    <div class="editor"></div>
                </div>
            </div>

            <div id="basic-modal" class="modal" tabindex="-1">
                <div class="modal-dialog">
                </div>
            </div>
        `;

        let localStorageScripts = LocalStorageData.getStorage();
        let html = nunjucks.renderString(actions, { 
            builtinScripts: [ 
                { 
                    name: "List all tables",
                    content:  await fetch('../wwwroot/scripts/listAllTables.js').then(x => x.text())
                }, 
                { 
                    name: "SQL Create tables",
                    content: await fetch('../wwwroot/scripts/createTablesSQL.js').then(x => x.text())
                },
                {
                    name: "Save as TXT",
                    content: 
                        await fetch('../wwwroot/scripts/partials/getSaveContent.js').then(x => x.text()) + "\n" +
                        await fetch('../wwwroot/scripts/saveAsTxt.js').then(x => x.text()) + "\n" +
                        `saveAsTxt(${this.draw.getWorldCharGrid().width}, ${this.draw.getWorldCharGrid().height});`
                },
                {
                    name: "Save as PNG",
                    content: await fetch('../wwwroot/scripts/takeScreenshot.js').then(x => x.text())   
                }
            ],
            localStorageScripts: localStorageScripts.scripts
        });
        document.querySelector(".scripting-container")!.innerHTML = html;
        
        document.querySelector('.show-json')?.addEventListener('click', () => {
            let modalTemplate = `    
                <div class="modal-content">
                    <div class="modal-header">
                        <p class="modal-title">Schema JSON</p>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <pre class="colored-code" data-lang="javascript">{{ tables }}</pre>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            `;
            let schemaJsonDataModal = new Modal('#basic-modal', {});
            let modalHtml = nunjucks.renderString(modalTemplate, { 
                tables: JSON.stringify(this.draw.schema.tables, null, 4)
            });
            document.querySelector('#basic-modal')!.querySelector('.modal-dialog')!.innerHTML = modalHtml;
            monaco.editor.colorizeElement(document.querySelector(".colored-code")!, { mimeType: "javascript"});
            schemaJsonDataModal.show();
        })
        document.querySelector('.modalling')?.addEventListener('click', () => {
            Manager.changeScene(new DrawScene(this.draw))
        })
        let editor = monaco.editor.create(document.querySelector('.editor')!, {
            value: this.editorValue,
            language: 'javascript',
        });
        window.addEventListener("resize", () => { editor.layout(); });

        let modalActivators = document.querySelectorAll('.script-modal') as NodeListOf<HTMLElement>;
        for (const modalActivator of modalActivators) {
            modalActivator.addEventListener('click', async (e) => {
                let script = new Script(modalActivator.dataset.name!, modalActivator.dataset.content!);
                let modalTemplate = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <p class="modal-title">{{ name }}</p>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body colored-code" style="max-height: 76vh; overflow: auto">
                            <pre>{{ content | safe }}</pre>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            {% if isLocalStorageScript %}
                                <button id="modal-delete-script-btn" type="button" class="btn btn-danger">Delete</button>
                            {% endif %}

                            <button id="modal-copy-to-clipboard-btn" type="button" class="btn btn-primary">Copy</button>
                            <button id="modal-copy-to-editor-btn" type="button" class="btn btn-primary">Paste to editor</button>
                        </div>
                    </div>
                `;

                // highlighting replaces regular space with nbsp;
                let html = (await monaco.editor.colorize(script.content, "javascript", { })).replaceAll("\u00a0", " ");
                console.log(html);
                let modal = new Modal('#basic-modal', {});
                let modalHtml = nunjucks.renderString(modalTemplate, { 
                    content: html,
                    name: script.name,
                    isLocalStorageScript: modalActivator.dataset.islocalstoragescript === "Y",
                });
                document.querySelector('#basic-modal')!.querySelector('.modal-dialog')!.innerHTML = modalHtml;
                document.querySelector('#modal-copy-to-clipboard-btn')?.addEventListener('click', (e) => {
                    navigator.clipboard.writeText(script.content);
                    modal.hide();
                });
                document.querySelector('#modal-copy-to-editor-btn')?.addEventListener('click', (e) => {
                    editor.setValue(script.content);
                    modal.hide();
                });
                document.querySelector('#modal-delete-script-btn')?.addEventListener('click', (e) => {
                    localStorageScripts.removeScript(script)
                    modal.hide();
                    this.editorValue = editor.getValue();
                    this.init();
                });
                modal.show();
            }); 
        }
        document.querySelector('.save-btn')?.addEventListener('click', (e) => {
            let modalTemplate = `
                <div class="modal-content">
                    <div class="modal-header">
                        <p class="modal-title">Save script to localstorage</p>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <label for="modal-save-text-name">Name:</label>
                        <input id="modal-save-text-name"></input>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button id="modal-save-btn" type="button" class="btn btn-primary">Save</button>
                    </div>
                </div>
            `;
            let modal = new Modal('#basic-modal', {});
            let modalHtml = nunjucks.renderString(modalTemplate, {});
            document.querySelector('#basic-modal')!.querySelector('.modal-dialog')!.innerHTML = modalHtml;
            document.querySelector('#modal-save-btn')?.addEventListener('click', (e) => {
                let name = (document.querySelector('#modal-save-text-name') as HTMLInputElement).value;
                if (! name) {
                    return;
                }
                localStorageScripts.addScript(new Script(name, editor.getValue()));
                modal.hide();
                this.editorValue = editor.getValue();
                this.init();
            })
            modal.show();
        })
        document.querySelector('.execute-btn')?.addEventListener('click', async (e) => {
            let value = editor.getValue();
            let oldConsoleLog = console.log;
            let result: string[] = [];
            console.log = function(message) { result.push(message); }
            let errorMsg = "";
            try {
                let fn = Function("schema", "dayjs", "PIXI", `"use strict"; ${value}`);
                fn(this.draw.schema, dayjs, PIXI);
            } catch (error: any) {
                errorMsg =  `${error.name}: ${error.message}`;
            }
            console.log = oldConsoleLog;
            let modalTemplate = `
                <div class="modal-content">
                    <div class="modal-header">
                        <p class="modal-title">
                        {% if not errorContent %}
                            Results
                        {% else %}
                            Error
                        {% endif %}
                        </p>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        {% if not errorContent %}
                            <pre>{{ successContent }}</pre>
                        {% else %}
                            <p style="color: red;">{{ errorContent }}</p>
                        {% endif %}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    </div>
                </div>
            `;
            let modal = new Modal('#basic-modal', {});
            let modalHtml = nunjucks.renderString(modalTemplate, {
                successContent: result.join("\n"),
                errorContent: errorMsg
            });
            document.querySelector('#basic-modal')!.querySelector('.modal-dialog')!.innerHTML = modalHtml;
            modal.show();
        });
    }

    destroyHtmlUi(): void {
        document.querySelector(".scripting-container")!.innerHTML = "";
    }
    
}