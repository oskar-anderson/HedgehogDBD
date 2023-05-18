import { Draw } from "./model/Draw";
import { MyRect } from "./model/MyRect";
import { SchemaDTO } from "./model/dto/SchemaDTO";


class RasterModelerFormat {

    public static parse(schema: string): Draw {
        let schemaDTO = SchemaDTO.parse(schema);
        return new Draw(
            schemaDTO.mapToSchema(), 
            new MyRect(0, 0, 3240, 2160)
        );
        /*
        const defaultFontSize = Draw.fontSizes.find(x => x.size === 14)!;
        return new Draw(
            new Schema(tables), 
            new MyRect(
                0, 0, 
                Math.floor(3240 / defaultFontSize.width) * defaultFontSize.width, 
                Math.floor(2160 / defaultFontSize.height) * defaultFontSize.height
            )
        );
        */
    }
}

export default RasterModelerFormat;