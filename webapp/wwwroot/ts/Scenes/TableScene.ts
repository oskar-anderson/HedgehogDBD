import { Container } from "pixi.js";
import { IScene, Manager } from "../Manager";
import { Draw } from "../model/Draw";
import { Modal } from 'bootstrap';
import { DrawScene } from "./DrawScene";
import * as nunjucks from "nunjucks";

export class TableScene extends Container implements IScene {

    draw: Draw;

    constructor(draw: Draw) {
        super();
        this.draw = draw;
        this.draw.tableBeingEdited = draw.selectedTable!.copy(true);
    }

    update(deltaMS: number): void {

    }

    initHtmlUi(): void {
        let template = `
        <div>
            <style>
                table {
                    font-family: arial, sans-serif;
                    border-collapse: collapse;
                    width: 100%;
                }
                
                td, th {
                    border: 1px solid #dddddd;
                    text-align: left;
                    padding: 8px;
                }

                th {
                    font-weight: bold;
                }

            </style>
            <div class="modal" tabindex="-1">
                <div class="modal-dialog" style="max-width: fit-content;">
                    <div class="modal-content">
                    <div class="modal-header">
                        <p class="modal-title">Table "${this.draw.tableBeingEdited?.head}"</p>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <table>
                        <tr>
                            <th>Name</th>
                            <th>Datatype</th>
                            <th>Attributes</th>
                            <th>Actions</th>
                        </tr>
                        {% for row in table.tableRows %}
                        <tr data-index="{{ loop.index0 }}">
                            <td>
                                <input class="input-name" type="text" value="{{ row.name }}">
                            </td>
                            <td>
                                <input class="input-datatype" type="text" value="{{ row.datatype }}">
                            </td>
                            <td>
                                <input class="input-attributes" type="text" value="{{ row.attributes }}">
                            </td>
                            <td>
                                <button class="up-btn btn btn-primary">Up</button>
                                <button class="down-btn btn btn-primary">Down</button>
                                <button class="delete-btn btn btn-danger">Delete</button>
                            </td>
                        </tr>
                        {% endfor %}
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" id="modal-save-changes" class="btn btn-primary">Save changes</button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
        `;

        let html = nunjucks.renderString(template, { table: this.draw.tableBeingEdited! }); 
        document.querySelector(".table-edit-container")!.innerHTML = html;
        let modalEl = document.querySelector(".modal")!
        let modal = new Modal(modalEl, {});
        modal.show();
        document.querySelector(".modal")!.addEventListener("hide.bs.modal", () => {
            console.log("modal closed!");
            Manager.changeScene(new DrawScene(this.draw))
        })
        document.querySelector("#modal-save-changes")!.addEventListener("click", () => {
            console.log("save-changes!");
            let oldTableElementIndex = this.draw.schema.tables.findIndex(x => x.id === this.draw.tableBeingEdited!.id)!;
            this.draw.selectedTable = this.draw.tableBeingEdited!;
            this.draw.schema.tables[oldTableElementIndex] = this.draw.tableBeingEdited!;
            console.log(this.draw.selectedTable);
            console.log(this.draw.schema.tables);
            modal.dispose();
            Manager.changeScene(new DrawScene(this.draw))
        })
        let upBtns = document.querySelectorAll(".up-btn")
        let downBtns = document.querySelectorAll(".down-btn")
        let deleteBtns = document.querySelectorAll(".delete-btn")
        for (const upBtn of upBtns) {
            upBtn.addEventListener('click', (e) => {
                let index = Number((e.target as HTMLElement).parentElement!.parentElement!.dataset.index!);
                if (index <= 0) return;
                [this.draw.tableBeingEdited!.tableRows[index], this.draw.tableBeingEdited!.tableRows[index - 1]] = 
                    [this.draw.tableBeingEdited!.tableRows[index - 1], this.draw.tableBeingEdited!.tableRows[index]];
                modal.dispose();
                this.initHtmlUi();
            })
        }
        for (const downBtn of downBtns) {
            downBtn.addEventListener('click', (e) => {
                let index = Number((e.target as HTMLElement).parentElement!.parentElement!.dataset.index!);
                if (index >= this.draw.tableBeingEdited!.tableRows.length - 1) return;
                [this.draw.tableBeingEdited!.tableRows[index], this.draw.tableBeingEdited!.tableRows[index + 1]] = 
                    [this.draw.tableBeingEdited!.tableRows[index + 1], this.draw.tableBeingEdited!.tableRows[index]];
                modal.dispose();
                this.initHtmlUi();
            })
        }
        for (const deleteBtn of deleteBtns) {
            deleteBtn.addEventListener('click', (e) => {
                let index = Number((e.target as HTMLElement).parentElement!.parentElement!.dataset.index!);
                this.draw.tableBeingEdited!.tableRows.splice(index, 1);
                modal.dispose();
                this.initHtmlUi();
            })
        }
    }
    
    destroyHtmlUi(): void {
        document.querySelector(".table-edit-container")!.innerHTML = ``;
        this.draw.tableBeingEdited = null;
    }


}
