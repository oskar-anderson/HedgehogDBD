import { Container } from "pixi.js";
import { IScene, Manager } from "../Manager";
import { Draw } from "../model/Draw";
import * as nunjucks from "nunjucks";
import { DrawScene } from "./DrawScene";

export class ScriptingScene extends Container implements IScene {

    draw: Draw;
    constructor(draw: Draw) {
        super();
        this.draw = draw;
    }

    update(deltaMS: number): void {
        
    }

    init(): void {
        let template = `
        <div>
            <button type="button" class="go-modalling btn btn-secondary">Go Modalling</button>
        </div>
        `;

        let html = nunjucks.renderString(template, {  }); 
        document.querySelector(".scripting-container")!.innerHTML = html;
        document.querySelector('.go-modalling')?.addEventListener('click', () => {
            Manager.changeScene(new DrawScene(this.draw))
        })
    }

    destroyHtmlUi(): void {
        document.querySelector(".scripting-container")!.innerHTML = "";
    }
    
}