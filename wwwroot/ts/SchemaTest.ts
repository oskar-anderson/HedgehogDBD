import { Parser } from "./Parser";

export class SchemaTest {
    
    static schema1: string = `
    
+-----------------------------------------+                                                              
| customers                               |                                                              
+--------------------------+---------+----+                                                              
| customer_id              | VARCHAR | PK |                                                              
| customer_first_name      | VARCHAR |    |                                                                                                                    
| customer_middle_initial  | VARCHAR |    |                                                                                                                   
| customer_last_name       | VARCHAR |    |                                                                                                                    
| gender                   | VARCHAR |    |                                                                                                                    
| email_address            | VARCHAR |    |             +----------------------------------+                      +-------------------------------+    
| login_name               | VARCHAR |    |             | orders                           |                      | invoices                      |    
| login_password           | VARCHAR |    |             +-------------------+---------+----+                      +----------------+---------+----+    
| phone_number             | VARCHAR |    |             | order_id          | VARCHAR | PK |                      | invoice_id     | VARCHAR | PK |    
| address_line_1           | VARCHAR |    |!...........m| customer_id       | VARCHAR | FK |!....................m| order_id       | VARCHAR | FK |    
| address_line_2           | VARCHAR |    |             | date_order_placed | VARCHAR |    |                      | invoice_date   | VARCHAR |    |    
| address_line_3           | VARCHAR |    |             | order_details     | VARCHAR |    |                      | invoice_detail | VARCHAR |    |    
| address_line_4           | VARCHAR |    |             +-------------------+---------+----+                      +----------------+---------+----+                                             
| town_city                | VARCHAR |    |                      !                                                                                             
| state_county_province    | VARCHAR |    |                      .                                                                                             
| country                  | VARCHAR |    |                      .                                                                                            
| order_details            | VARCHAR |    |                      .                                                                                            
+--------------------------+---------+----+                      .                                       
                                                                 .                                       
                                                                 m                                       
                                                        +----------------------------------+                                                 
                                                        | order_items                      |                                                 
+------------------------------------+                  +-------------------+---------+----+                                                 
| products                           |                  | order_item_id     | VARCHAR | PK |                                                 
+---------------------+---------+----+                  | order_id          | VARCHAR | FK |                                                 
| product_id          | VARCHAR | PK |!................m| product_id        | VARCHAR | FK |                                                 
| product_type_id     | VARCHAR | FK |                  | product_quantity  | VARCHAR |    |                                                 
| product_name        | VARCHAR |    |                  | other_details     | VARCHAR |    |                                                 
| product_price       | VARCHAR |    |                  +-------------------+---------+----+                                                 
| product_size        | VARCHAR |    |                                                                     
| product_description | VARCHAR |    |                                                                     
| other_details       | VARCHAR |    |                                                                     
+---------------------+---------+----+                                                                     
                 m     
                 .
                 .
                 .
                 .
                 .
                 .
                 .
                 .
                 .                     /........\
                 .                     .        .
                 !                     ?        .
+------------------------------------------+    .
| product_types                            |m.../
+--------------------------+----------+----+
| product_type_id          | VARCHAR  | PK |
| parent_type_id           | VARCHAR? | FK |
| product_name             | VARCHAR  |    |
| product_type_description | VARCHAR  |    |
+--------------------------+----------+----+
`;
    
    constructor() {

    }

    static parseTest1() {
        new Parser().parse(SchemaTest.schema1)
    }


    static main() {
        this.parseTest1();
    }
}