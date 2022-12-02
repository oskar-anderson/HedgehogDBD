import { Container } from "pixi.js";
import { IScene, Manager } from "../Manager";
import { Draw } from "../model/Draw";
import * as nunjucks from "nunjucks";
import { DrawScene } from "./DrawScene";
import { Modal } from "bootstrap";
import * as monaco from 'monaco-editor';
import { LocalStorageData, Script } from "../model/LocalStorageData";

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

            <style>

                .editor-tab-container {
                    white-space: nowrap;
                    overflow-x: auto;
                }
                
                .editor-tab {
                    padding: 0 6px;
                }

                *[contenteditable] {
                    outline: none
                }

                .close-icon:hover {
                    background-color: #eee;
                    filter: brightness(50%);
                    border-radius: 4px;
                }

                .tree-expand > * {
                    display: none;
                }
                
                .tree-expand.open > * {
                    display: block;
                }
                
            </style>

            <header style="display: flex; align-items:center; padding: 2px 0">
                <span style="display: flex; justify-content: center; width: 4em">Actions</span>
                <div class="bar btn-group btn-group-toggle">
                    <button type="button" class="modalling btn btn-light">Go Modalling</button>
                    <button type="button" class="show-json btn btn-light">Show JSON</button>
                </div>
            </header>
            <div>
                <div>
                    <span>Builtin scripts:</span>
                    <ul>
                    {% for script in builtinScripts %}
                        <li class="modal-popup" data-content="{{ script.content }}" data-name="{{ script.name }}" data-islocalstoragescript="N">
                            <span>{{ script.name }}</span>
                        </li>
                    {% endfor %}
                    </ul>
                    <span>LocalStorage scripts:</span>
                    <ul>
                    {% for script in localStorageScripts %}
                        <li class="modal-popup" data-content="{{ script.content }}" data-name="{{ script.name }}" data-islocalstoragescript="Y">
                            <span>{{ script.name }}</span>
                        </li>
                    {% endfor %}
                    </ul>
                </div>
                    
                <div>
                    <svg width="16" height="16" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
                        <title>Save</title>
                        <g>
                            <rect x="84.261" y="256" style="fill:#10BAFC;" width="306.573" height="245.551"/>
                            <rect x="84.261" y="10.449" style="fill:#10BAFC;" width="65.285" height="164.645"/>
                        </g>
                        <rect x="149.546" y="10.449" style="fill:#FFFFFF;" width="241.288" height="164.645"/>
                        <path style="fill:#3F5968;" d="M501.551,63.578v437.973H390.837V255.996H84.26v245.555H10.449V10.449H84.26v164.648h306.577V10.449h57.585L501.551,63.578z"/>
                        <path d="M508.939,56.189L455.811,3.061C453.851,1.101,451.193,0,448.422,0h-57.585H149.545H84.26H10.449C4.678,0,0,4.678,0,10.449v491.102C0,507.322,4.678,512,10.449,512H84.26c0.014,0,0.027-0.002,0.041-0.002h306.497c0.014,0,0.027,0.002,0.041,0.002h110.713c5.771,0,10.449-4.678,10.449-10.449V63.578C512,60.807,510.899,58.149,508.939,56.189z M159.994,20.898h220.394v143.75H159.994V20.898z M139.096,164.648H94.709V20.898h44.387V164.648z M380.388,491.1H94.709V266.445h285.679V491.1z M491.102,491.102h-89.815V255.996c0-5.771-4.678-10.449-10.449-10.449h-0.001H84.26c-5.771,0-10.449,4.678-10.449,10.449v235.106H20.898V20.898h52.913v154.199c0,5.771,4.678,10.449,10.449,10.449h65.285h241.292c5.771,0,10.449-4.678,10.449-10.449V20.898h42.808l47.008,47.008V491.102z"/>
                        <path d="M328.385,32.643c-5.771,0-10.449,4.678-10.449,10.449v99.356c0,5.771,4.678,10.449,10.449,10.449c5.771,0,10.449-4.678,10.449-10.449V43.092C338.834,37.321,334.156,32.643,328.385,32.643z"/>
                        <path d="M300.583,449.551h27.804c5.771,0,10.449-4.678,10.449-10.449c0-5.771-4.678-10.449-10.449-10.449h-27.804c-5.771,0-10.449,4.678-10.449,10.449C290.134,444.873,294.812,449.551,300.583,449.551z"/>
                        <path d="M146.71,449.551h120.784c5.771,0,10.449-4.678,10.449-10.449c0-5.771-4.678-10.449-10.449-10.449H146.71c-5.771,0-10.449,4.678-10.449,10.449C136.261,444.873,140.939,449.551,146.71,449.551z"/>
                        <path d="M300.583,392.775h27.804c5.771,0,10.449-4.678,10.449-10.449c0-5.771-4.678-10.449-10.449-10.449h-27.804c-5.771,0-10.449,4.678-10.449,10.449C290.134,388.097,294.812,392.775,300.583,392.775z"/>
                        <path d="M146.71,392.775h120.784c5.771,0,10.449-4.678,10.449-10.449c0-5.771-4.678-10.449-10.449-10.449H146.71c-5.771,0-10.449,4.678-10.449,10.449C136.261,388.097,140.939,392.775,146.71,392.775z"/>
                        <path d="M300.583,336h27.804c5.771,0,10.449-4.678,10.449-10.449c0-5.771-4.678-10.449-10.449-10.449h-27.804c-5.771,0-10.449,4.678-10.449,10.449C290.134,331.323,294.812,336,300.583,336z"/>
                        <path d="M146.71,336h120.784c5.771,0,10.449-4.678,10.449-10.449c0-5.771-4.678-10.449-10.449-10.449H146.71c-5.771,0-10.449,4.678-10.449,10.449C136.261,331.323,140.939,336,146.71,336z"/>
                    </svg>
                    <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <title>Execute</title>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                    <span>
                        <title>Rename</title>
                        F2
                    </span>

                </div>
                
                <div class="editor-tab-container" style="display: flex">
                    <span class="editor-tab">
                        <span style="width: 100px;" contenteditable="true">new_script1</span>
                        <span>
                            <svg class="close-icon" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </span>
                    </span>

                    <span class="editor-tab">
                        <span style="width: 100px;" contenteditable="true">new_script2ssssssssssssssssssssssssssssssssssssssssssssss</span>
                        <span>
                            <svg class="close-icon" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </span>
                    </span>

                    <span class="editor-tab">
                        <span style="width: 100px;" contenteditable="true">new_script3</span>
                        <span>
                            <svg class="close-icon" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </span>
                    </span>

                </span>
                </div>
                <div class="editor"></div>
            </div>

            <div class="modal show-schema-json-data" tabindex="-1">
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


            <div id="basic-modal" class="modal" tabindex="-1">
                <div class="modal-dialog">
                </div>
            </div>

        `;


        let localStorageScripts = LocalStorageData.getStorage();
        let html = nunjucks.renderString(actions, { 
            tables: JSON.stringify(this.draw.schema.tables, null, 4),
            builtinScripts: [ 
                { name: "Script1", content: "console.log('hello');" }, 
                { name: "Script2", content: "console.log(2);" }
            ],
            localStorageScripts: localStorageScripts.scripts
        });
        document.querySelector(".scripting-container")!.innerHTML = html;


        let schemaJsonDataModalRef = document.querySelector(".show-schema-json-data")!
        let schemaJsonDataModal = new Modal(schemaJsonDataModalRef, {});
        document.querySelector('.show-json')?.addEventListener('click', () => {
            schemaJsonDataModal.show();
        })
        document.querySelector('.modalling')?.addEventListener('click', () => {
            Manager.changeScene(new DrawScene(this.draw))
        })
        let editor = monaco.editor.create(document.querySelector('.editor')!, {
            value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
            language: 'javascript',
        });
        window.addEventListener("resize", () => { editor.layout(); });

        let modalActivators = document.querySelectorAll('.modal-popup') as NodeListOf<HTMLElement>;
        for (const modalActivator of modalActivators) {
            modalActivator.addEventListener('click', function(e) {
                let script = new Script(modalActivator.dataset.name!, modalActivator.dataset.content!);
                let modalTemplate = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <p class="modal-title">{{ name }}</p>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <pre id="modal-code-block" data-lang="javascript">{{ content }}</pre>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            {% if isLocalStorageScript %}
                                <button id="modal-delete-script-btn" type="button" class="btn btn-danger">Delete</button>
                            {% endif %}

                            <button id="modal-copy-to-editor-btn" data-code="{{ content }}" type="button" class="btn btn-primary">Copy to editor</button>
                        </div>
                    </div>
                `;
                let modal = new Modal('#basic-modal', {});
                let modalHtml = nunjucks.renderString(modalTemplate, { 
                    content: script.content,
                    name: script.name,
                    isLocalStorageScript: modalActivator.dataset.islocalstoragescript === "Y",
                });
                document.querySelector('#basic-modal')!.querySelector('.modal-dialog')!.innerHTML = modalHtml;
                monaco.editor.colorizeElement(document.querySelector("#modal-code-block")!, { mimeType: "javascript"});
                document.querySelector('#modal-copy-to-editor-btn')?.addEventListener('click', (e) => {
                    editor.setValue(script.content);
                    modal.hide();
                });
                document.querySelector('#modal-delete-script-btn')?.addEventListener('click', (e) => {
                    localStorageScripts.scripts.splice(
                        localStorageScripts.scripts.findIndex(x => JSON.stringify(x) === JSON.stringify(script)), 
                        1);
                    localStorageScripts.setStorage()
                    modal.hide();
                });
                modal.show();
            });
            
        }
    }

    destroyHtmlUi(): void {
        document.querySelector(".scripting-container")!.innerHTML = "";
    }
    
}