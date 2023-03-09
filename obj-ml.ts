import {lispToCamel} from 'trans-render/lib/lispToCamel.js';

/**
 * Provides a declarative, HTML-based markup language to instantiate, and update, a JavaScript object
 * @element obj-ml
 * @tag obj-ml
 */
export class ObjML extends HTMLElement {
    #internals: ElementInternals | undefined; 
    static formAssociated = true;
    connectedCallback(){
        this.#internals = this.attachInternals();
        //this.doFullMerge();
        //this.addMutationObserver();
        //this.addEventListeners();
       
    }
    async doFullMerge(){
        const obj: any = {};
        for(const attrib of this.attributes){
            assignAttr(obj, attrib);
        }
        for(const child of this.children){
            const oChild = child as ObjML;
            const itemprop = oChild.getAttribute("itemprop");
            if(itemprop === null) continue;
            if(obj[itemprop] !== undefined && Array.isArray(obj[itemprop])){
                obj[itemprop].push(oChild.value);
            }else{
                obj[itemprop] = oChild.value;
            }
            
        }
        this._value = obj;
        if(this._observer === undefined){
            this.addMutationObserver();
            this.addEventListeners();
        }
    }

    _value: any;
    /**
     * The value of the node
     */
    get value(){
        if(this._value === undefined){
            this.doFullMerge()
        }
        return this._value;
    }


    set value(nv: any){
        this._value = nv;
        this.dispatchEvent(new CustomEvent('value-changed', {
            bubbles: true,
            detail:{
                value: nv,
                propLastChanged: this._propLastChanged
            }
        }));
        //https://github.com/microsoft/fast/blob/master/packages/web-components/fast-foundation/src/form-associated/form-associated-custom-element.spec.md
        const pe = this.parentElement;
        if(pe === null || !(pe instanceof ObjML)){
            this.#internals!.setFormValue(JSON.stringify(nv));
        }
        
    }

    onMutation(mutationsList: MutationRecord[], observer: MutationObserver){
        for(const mutation of mutationsList) {
            // if (mutation.type === 'childList') {
            //     const addedNodes = mutation.addedNodes;
            //     for(const oChild of addedNodes){
            //         if(!(oChild instanceof ObjML) && !(oChild instanceof HTMLInputElement)) continue;
            //         const itemprop = oChild.getAttribute("itemprop");
            //         if(itemprop === null) continue;
            //         this.setVal(itemprop, oChild);
            //     }
                
            // }
            if (mutation.type === 'attributes') {
                const name = mutation.attributeName!;
                if(name === 'form') continue;
                const obj = this.value || {};
                assignAttr(obj, this.getAttributeNode(name)!); //TODO:  remove attribute?
                this._propLastChanged = name;
                this.value = obj;                
            }
        }
    }
    setVal(name: string, oChild: ObjML | HTMLInputElement){
        if(this.isNameUnique(name, oChild)){
            const obj = this.value || {};
            obj[name] = oChild.value;
            this._propLastChanged = name;
            this.value = obj;
            
        }else{
            const currVal = this.value === undefined ? undefined : this.value[name];
            let newVal = [];
            if(currVal !== undefined){
                if(!Array.isArray(currVal)){
                    newVal = [currVal]
                }else{
                    newVal = currVal;
                }
            } 
            newVal.push(oChild.value);
            this.value[name] = newVal;
        }
        const wr = new WeakRef(oChild);
        this._groupedByName[name] = [wr];
    }
    _observer: MutationObserver | undefined;
    _propLastChanged: string | undefined;
    addMutationObserver(){
        //const config = { attributes: true, childList: true, subtree: false };
        const config = {attributes: true};
        const callBack = this.onMutation.bind(this);
        this._observer = new MutationObserver(callBack);
        this._observer.observe(this, config);
    }

    handleEvent = (e: Event) => {
        const target = e.target as ObjML | HTMLInputElement;
        if(target=== null) return; 
        const itemprop = target.getAttribute('itemprop');
        if(itemprop === null || target.parentElement !== this) return;
        e.stopPropagation();
        this._propLastChanged = itemprop;
        this.setVal(itemprop, target);
    }
    addEventListeners(){
        this.addEventListener('input', this.handleEvent);
        this.addEventListener('value-changed', this.handleEvent);
    }

    disconnectedCallback(){
        if(this._observer !== undefined){
            this._observer.disconnect();
        }
    }

    _groupedByName: {[key: string]: WeakRef<Element>[]} = {};
    isNameUnique(name: string, newElement: Element){
        const matchingByName = this._groupedByName[name];
        if(matchingByName === undefined || matchingByName.length === 0) return true;
        for(const el of matchingByName){
            const deref = el.deref();
            if(deref !== undefined && deref !== newElement) return false;
        }
        return true;
    }
}

function assignAttr(obj: any, attrib: Attr){
    const name = attrib.name;
    if( name === 'form' || name=== 'itemprop') return;
    const posOfFirstDash = name.lastIndexOf('-');
    let type = 'str';
    let propName = name;
    if(posOfFirstDash !== -1) {
        type = name.substr(posOfFirstDash + 1);
        propName = lispToCamel(name.substr(0, posOfFirstDash));
    }
    const val = attrib.value;
    switch(type){
        case 's':
        case 'str':
            obj[propName] = val;
            break;
        case 'b':
        case 'bool':
            obj[propName] = val !== 'false';
            break;
        case 'i':
        case 'int':
            obj[propName] = parseInt(val);
            break;
        case 'n':
        case 'num':
            let num = Number(val);
            if(isNaN(num)){
                num = np.parse(val);
            }
            obj[propName] = num;
            break;
        // case 'l':
        // case 'list':
        //     if(!Array.isArray(obj[propName])){
        //         obj[propName] = [];
        //     }
        //     break;
        case 'o':
        case 'obj':
            obj[propName] = JSON.parse(val);
            break;
        case 'd':
        case 'date':
            obj[propName] = new Date(Date.parse(val));
            break;
        case 'f':
        case 'float':
            obj[propName] = parseFloat(val);
            break;
        default:
            propName = lispToCamel(name);
            obj[propName] = val;
    }
    
}
customElements.define('obj-ml', ObjML);

//https://stackoverflow.com/questions/55364947/is-there-any-javascript-standard-api-to-parse-to-number-according-to-locale
class NumberParser {
    #group!: RegExp;
    #decimal!:RegExp;
    #numeral!:RegExp;
    #index!: (d: string) => number;
    constructor(locale: string) {
      const format = new Intl.NumberFormat(locale);
      const parts = format.formatToParts(12345.6);
      const numerals = Array.from({ length: 10 }).map((_, i) => format.format(i));
      const index = new Map(numerals.map((d, i) => [d, i]));
      this.#group = new RegExp(`[${parts.find(d => d.type === "group")!.value}]`, "g");
      this.#decimal = new RegExp(`[${parts.find(d => d.type === "decimal")!.value}]`);
      this.#numeral = new RegExp(`[${numerals.join("")}]`, "g");
      this.#index = d => index.get(d)!;
    }
    parse(string: string) {
      return (string = string.trim()
        .replace(this.#group, "")
        .replace(this.#decimal, ".")
        .replace(this.#numeral, this.#index as any as string)) ? +string : NaN;
    }
  }

  const userLocale =
  navigator.languages && navigator.languages.length
    ? navigator.languages[0]
    : navigator.language;
const np = new NumberParser(userLocale);

declare global {
    interface HTMLElementTagNameMap {
        "obj-ml": ObjML,
    }
}