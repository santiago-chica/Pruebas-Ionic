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
  private justCalculated: boolean = false;

  radianMode: boolean = false;


  constructor() {}

  private safeEval(expr: string): number {

    if (!/^(?:[0-9+\-*/()^.\s]|sen|sin|cos|tan|pi|e|π)+$/.test(expr)) {
      throw new Error("Error de sintaxis");
    }

    const replacements: Array<[RegExp, any]> = [
      // constantes
      [/π/g,       'Math.PI'],
      [/\be\b/g,   'Math.E'],

      // funciones trigonometricas
      [/\bsen\b/g, 'sin'], // por si acaso
      [/\bsin\b/g, 'Math.sin'],
      [/\bcos\b/g, 'Math.cos'],
      [/\btan\b/g, 'Math.tan'],

      // operador de potencia
      [/\^/g, '**'],

      // convertir grados a radianes (condicional radianMode)
      ...(
        this.radianMode
          ? []
          : [[
          /Math\.(sin|cos|tan)\(([^)]+)\)/g, (_: string, fn: string, arg: string) => `Math.${fn}(((${arg}) * Math.PI) / 180)`
        ] as [RegExp, any]]
      ),
    ];

    for (const [pattern, replacer] of replacements) {
      expr = expr.replace(pattern, replacer);
    }

    const implicitMultiplicationPatterns: Array<[RegExp, string]> = [
      [/(\d)(?=\()/g, '$1*'],              // 2( → 2*(
      [/(\d)(?=Math\.)/g, '$1*'],          // 2Math → 2*Math
      [/(\))(\d)/g, '$1*$2'],              // )2 → )*2
      [/(\))(Math\.)/g, '$1*$2'],          // )Math → )*Math
      [/((Math\.PI|\d|\)))(?=\()/g, '$1*']   // PI( → PI*( or 2( → 2*(
    ];

    for (const [pattern, replacement] of implicitMultiplicationPatterns) {
      expr = expr.replace(pattern, replacement);
    }
    
    let final_result = Function("return " + expr)();

    if (typeof final_result === 'number') {
      final_result = parseFloat(final_result.toFixed(10));
    }

    return final_result;
  }

  toggleRadianMode() {
    this.radianMode = !this.radianMode;
  }

  getCurrentString(): string {
    return this.currentString || '0';
  }

  getLastResultString(): string {
    return this.lastResult !== 0 ? this.lastResult.toString() : '';
  }

  getRadianString(): string {
    return this.radianMode ? 'RAD' : 'DEG';
  }

  addCharacter(char: string) {
    if (this.errored) return;

    if (this.justCalculated) {
      this.currentString = '';
      this.justCalculated = false;
    }

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
    this.justCalculated = false;
  }

  clear(removeLast: boolean = false) {
    if (removeLast) {this.lastResult = 0};
    this.currentString = '';
    this.errored = false;
    this.justCalculated = false;
  }

  calculateResult() {
    if (this.errored) return;
    if (!this.currentString) return;

    try {
      const result = this.safeEval(this.currentString);

      this.currentString = result.toString();
      this.lastResult = result;
      this.justCalculated = true;
    } catch (e) {
      this.errored = true;
      this.lastResult = 0;
      this.currentString = 'Error';
    }
  }
}
