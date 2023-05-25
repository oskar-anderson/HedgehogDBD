import { Draw } from "./model/Draw";
import { MyRect } from "./model/MyRect";
import { SchemaDTO } from "./model/dto/SchemaDTO";
import { Schema } from "./model/Schema";


class RasterModelerFormat {

    public static parse(schema: string): Schema {
        let schemaDTO = SchemaDTO.parse(schema);
        return schemaDTO.mapToSchema();
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