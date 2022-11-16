import { Container } from "pixi.js";
import { IScene, Manager } from "../Manager";
import { Draw } from "../model/Draw";
import { Modal } from 'bootstrap';
import { DrawScene } from "./DrawScene";

export class TableScene extends Container implements IScene {

    draw: Draw;

    constructor(draw: Draw) {
        super();
        this.draw = draw;


    }

    update(deltaMS: number): void {

    }
    initHtmlUi(): void {

        document.querySelector(".table-edit-container")!.innerHTML = `
            <div class="modal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Table "${this.draw.selectedTable?.head}"</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Modal body text goes here.</p>
                        <ul>
                            <li>
                                list item 1
                            </li>
                            <li>
                                list item 2
                            </li>
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary">Save changes</button>
                    </div>
                    </div>
                </div>
            </div>

        `;
        let modalEl = document.querySelector(".modal")!
        let modal = new Modal(modalEl, {});
        modal.show();
        document.querySelector(".modal")!.addEventListener("hide.bs.modal", () => {
            console.log("modal closed!");
            Manager.changeScene(new DrawScene(this.draw))
        })
    }
    
    destroyHtmlUi(): void {
        document.querySelector(".table-edit-container")!.innerHTML = ``;
    }


}
