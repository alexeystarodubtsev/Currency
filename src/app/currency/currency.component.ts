import { Component, OnInit } from '@angular/core';
import { DataService } from "../../_services/data.service";
import { switchMap, catchError } from "rxjs/operators";
import { of } from "rxjs"
@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.css'],
  providers : [DataService]
})
export class CurrencyComponent implements OnInit {

  constructor(private dataService: DataService) { }

  currency : number;
  loading : boolean = true;
  error : boolean = false;


  ngOnInit(): void {
    this.getData();
  }

  getData() {
    const sub = this.dataService.getCurrencies()
      .subscribe((next : any) => {
        next.stream$.pipe(catchError(err => {
          sub.unsubscribe();
          this.getData();
          return of();
        })).subscribe(data => {
             this.loading = false;
             this.currency = next.parser(data, "EUR")
        });
      },
      err => {
        this.error = true;
        console.error(err);
        this.loading = false;
      })
  }

}
