import { Container } from "pixi.js";
import * as PIXI from "pixi.js";
import { IScene, Manager } from "../Manager";
import { Draw } from "../model/Draw";
import * as nunjucks from "nunjucks";
import { DrawScene } from "./DrawScene";
import Modal from "bootstrap/js/dist/modal"; // import { Modal } from "boostrap"; // this causes bootstrap collapse to not work in pure HTML, do not use
import * as monaco from 'monaco-editor';
import { LocalStorageData, Script } from "../model/LocalStorageData";
import dayjs from "dayjs";  // used in scripts
import { TableDTO } from "../model/TableDTO";
import { SchemaDTO } from "../model/SchemaDTO";

export class ScriptingScene extends Container implements IScene {

    editorValue: string = "";
    draw: Draw;
    constructor(draw: Draw) {
        super();
        this.draw = draw;
    }

    mouseEventHandler(event: MouseEvent): void {
        
    }

    update(deltaMS: number): void {
        
    }

    async init(): Promise<void> {
        let scriptEl = document.createElement('script');
        scriptEl.setAttribute('src', 'https://utteranc.es/client.js');
        scriptEl.setAttribute('crossorigin', 'anonymous');
        scriptEl.setAttribute('async', 'true');
        scriptEl.setAttribute('repo', 'oskar-anderson/RasterModeler');
        scriptEl.setAttribute('issue-term', 'scripting-comments');
        scriptEl.setAttribute('theme', 'github-light');
        document.querySelector('.comment-container')!.appendChild(scriptEl);
        let topMenuActions = await fetch("./partial/navbar.html").then(x => x.text());
        document.querySelector(".top-menu-action-container")!.innerHTML = topMenuActions;
        document.querySelector(".nav-draw")?.addEventListener('click', () => {  // from partial
            Manager.changeScene(new DrawScene(this.draw));
        })
        let actions = `
            <div>
                <div class="mt-4 mx-2">
                    <div class="h4">Scripts</div>
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-sm-12">
                                <ul class="list-group">
                                {% for script in builtinScripts %}
                                    <li class="script-modal list-group-item d-flex justify-content-between" data-content="{{ builtinScriptsJson[loop.index0] }}">
                                        <span>{{ script.name }}</span>
                                        <div>
                                        {% for tag in script.tags %}
                                            <span class="badge bg-info rounded-pill">{{ tag }}</span>
                                        {% endfor %}
                                        </div>
                                    </li>
                                {% endfor %}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-4 mx-2">
                    <div class="h4">Editor</div>
                    <div>
                        <button type="button" class="save-btn btn btn-light">Save</button>
                        <button type="button" class="execute-btn btn btn-light">Execute</button>
                        <button type="button" class="show-json btn btn-light">Show JSON</button>
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
        let scripts = [ 
            new Script(
                "List tables", 
                await fetch('../wwwroot/scripts/listAllTables.js').then(x => x.text()), 
                ["builtin"]
            ),
            new Script(
                "SQL CREATE",
                await fetch('../wwwroot/scripts/createTablesSQL.js').then(x => x.text()),
                ["builtin", "SQL"]
            ),
            new Script(
                "Export TXT",
                await fetch('../wwwroot/scripts/saveAsTxt.js').then(x => x.text()),
                ["builtin"]
            ),
            new Script(
                "Export clipboard",
                await fetch('../wwwroot/scripts/saveToClipboard.js').then(x => x.text()),
                ["builtin"]
            ),
            new Script(
                "Export PNG",
                await fetch('../wwwroot/scripts/takeScreenshot.js').then(x => x.text()),
                ["builtin", "async"]
            )
        ].concat(localStorageScripts.scripts);
        let html = nunjucks.renderString(actions, { 
            builtinScripts: scripts,
            builtinScriptsJson: scripts.map(x => JSON.stringify(x))
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
                        <pre class="colored-code" data-lang="javascript">{{ schema }}</pre>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            `;
            let schemaJsonDataModal = new Modal('#basic-modal', {});
            let schemaDTO = new SchemaDTO(
                this.draw.schema.tables.map(x => new TableDTO({ head: x.head, tableRows: x.tableRows })),
                [], // this.draw.schema.worldDrawArea  // cannot be displayed
                this.draw.getWorldCharGrid().width,
                this.draw.getWorldCharGrid().height
            );
            let modalHtml = nunjucks.renderString(modalTemplate, { 
                schema: JSON.stringify(schemaDTO, null, 4)
            });
            document.querySelector('#basic-modal')!.querySelector('.modal-dialog')!.innerHTML = modalHtml;
            monaco.editor.colorizeElement(document.querySelector(".colored-code")!, { mimeType: "javascript"});
            schemaJsonDataModal.show();
        })
        let editor = monaco.editor.create(document.querySelector('.editor')!, {
            value: this.editorValue,
            language: 'javascript',
        });
        window.addEventListener("resize", () => { editor.layout({ width:  window.innerWidth - 20, height: 400 }) });

        let modalActivators = document.querySelectorAll('.script-modal') as NodeListOf<HTMLElement>;
        for (const modalActivator of modalActivators) {
            modalActivator.addEventListener('click', async (e) => {
                let scriptJSON = JSON.parse(modalActivator.dataset.content!);
                let name = scriptJSON.name;
                let content = scriptJSON.content;
                let tags = scriptJSON.tags as string[];
                let script = new Script(name, content, tags);
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

                            <button id="modal-execute-btn" type="button" class="btn btn-primary">⚡ Execute</button>
                            <button id="modal-copy-to-editor-btn" type="button" class="btn btn-primary">Paste to editor</button>
                        </div>
                    </div>
                `;

                // highlighting replaces regular space with nbsp;
                let html = (await monaco.editor.colorize(script.content, "javascript", { })).replaceAll("\u00a0", " ");
                let modal = new Modal('#basic-modal', {});
                let modalHtml = nunjucks.renderString(modalTemplate, { 
                    content: html,
                    name: script.name,
                    isLocalStorageScript: !tags.includes("builtin"),
                });
                document.querySelector('#basic-modal')!.querySelector('.modal-dialog')!.innerHTML = modalHtml;
                document.querySelector('#modal-execute-btn')?.addEventListener('click', (e) => {
                    modal.hide();
                    this.executeAndShowResult(script.content);
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
                localStorageScripts.addScript(new Script(name, editor.getValue(), []));
                modal.hide();
                this.editorValue = editor.getValue();
                this.init();
            })
            modal.show();
        })
        document.querySelector('.execute-btn')?.addEventListener('click', (e) => this.executeAndShowResult(editor.getValue()));
    }

    async executeAndShowResult(value: string) {
        let executeResult = ScriptingScene.execute(value, this.draw);
        let errorMsg = executeResult.error;
        let resultLog = executeResult.resultLog;
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
            successContent: resultLog.join("\n"),
            errorContent: errorMsg
        });
        document.querySelector('#basic-modal')!.querySelector('.modal-dialog')!.innerHTML = modalHtml;
        modal.show();
    }

    static execute(value: string, draw: Draw) {
        let resultLog: string[] = [];
        let errorMsg = "";
        let schemaDTO = new SchemaDTO(
            draw.schema.tables.map(x => new TableDTO({ head: x.head, tableRows: x.tableRows })),
            draw.schema.worldDrawArea,
            draw.getWorldCharGrid().width,
            draw.getWorldCharGrid().height
            );
        try {
            let fn = Function("RESULT_LOG", "schema", "dayjs", "PIXI", `"use strict"; ${value}`);
            fn(resultLog, schemaDTO, dayjs, PIXI);
        } catch (error: any) {
            errorMsg = `${error.name}: ${error.message}`;
        }
        return {
            error: errorMsg,
            resultLog: resultLog
        }
    }

    destroyHtmlUi(): void {
        document.querySelector(".scripting-container")!.innerHTML = "";
        document.querySelector(".top-menu-action-container")!.innerHTML = "";
        document.querySelector('.comment-container')!.innerHTML = "";
    }
    
}