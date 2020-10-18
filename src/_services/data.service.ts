import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { xml2json } from "xml-js"
import { interval, of, Observable } from "rxjs"
import { map, switchMap, startWith } from "rxjs/operators"

@Injectable({ providedIn: 'root' })
export class DataService {
    constructor(private http: HttpClient) { }
    paths = [
        {
            url : "https://www.cbr-xml-daily.ru/daily_utf8.xml",
            parser : (doc, currCode) => {
                const json = JSON.parse(xml2json(doc))
                return json.elements[0].elements
                    .find(cur => {
                            const Name = cur.elements
                            .find(fields => 
                                fields.name === "CharCode"
                            );
                            return Name.elements[0].text == currCode;
                    })
                    .elements.find(fields => 
                        fields.name === "Value"
                    ).elements[0].text;
            }
        },
        {
            url : "https://www.cbr-xml-daily.ru/daily_json.js",
            parser : (doc, currCode) => {
                return JSON.parse(doc).Valute[currCode].Value;
            }
        }
    ]
    currentpath = this.paths.length - 1;
    limitAttempts = 10;

    getCurrencies() {
        this.limitAttempts --;
        if (this.currentpath < this.paths.length - 1)
            this.currentpath ++;
        else 
            this.currentpath = 0;
        if (this.limitAttempts <= 0)
            return new Observable(observer => {
                observer.error("Exceeded number of attempts to connect with server");
            });
        return interval(10000)
            .pipe(
                startWith(0),
                switchMap(event => {
                    return of (this.paths[this.currentpath])
                        .pipe(map(path => ({
                            parser : path.parser,
                            stream$ : this.http.get(path.url, {responseType : 'text'})
                        })))
                })
            )
               
    }
}