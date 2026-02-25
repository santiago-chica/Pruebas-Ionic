import { Component } from '@angular/core';
import { IonGrid, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonicModule],
})

export class HomePage {
  private currentString: string = '';
  private lastResult: number = 0;
  private errored: boolean = false;

  constructor() {}

  private safeEval(expr: string): number {
    if (!/^[0-9+\-*/()^.\sA-Za-z]+$/.test(expr)) {
      throw new Error("Error de sintaxis");
    }

    expr = expr.replace(/\bsen\b/g, "sin");
    expr = expr.replace(/\bsin\b/g, "Math.sin");
    expr = expr.replace(/\bcos\b/g, "Math.cos");
    expr = expr.replace(/\btan\b/g, "Math.tan");
    expr = expr.replace(/\^/g, "**");

    expr = expr.replace(/Math\.(sin|cos|tan)\(([^)]+)\)/g, 
      (_, fn, arg) => `Math.${fn}(((${arg}) * Math.PI) / 180)`
    );

    expr = expr.replace(/(\d)\(/g, "$1*(");
    expr = expr.replace(/\)(\d)/g, ")*$1");    
    expr = expr.replace(/\)\(/g, ")*(");        
    expr = expr.replace(/(\d)(Math\.)/g, "$1*$2"); 
    expr = expr.replace(/\)(Math\.)/g, ")*$1"); 

    return Function("return " + expr)();
  }

  getCurrentString(): string {
    return this.currentString || '0';
  }

  addCharacter(char: string) {
    if (this.errored) return;

    if (this.currentString === '0' && char !== '.') {
      this.currentString = '';
    }

    this.currentString += char;
  }

  addAnswer() {
    this.addCharacter(this.lastResult.toString());
  }

  clearOne() {
    if (this.errored) return;
    this.currentString = this.currentString.slice(0, -1);
  }

  clear(removeLast: boolean = false) {
    if (removeLast) {this.lastResult = 0};
    this.currentString = '';
    this.errored = false;
  }

  calculateResult() {
    if (this.errored) return;
    if (!this.currentString) return;

    try {
      const result = this.safeEval(this.currentString);

      this.currentString = result.toString();
      this.lastResult = result;
    } catch (e) {
      this.errored = true;
      this.lastResult = 0;
      this.currentString = 'Error';
    }
  }
}
