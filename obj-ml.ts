import {lispToCamel} from 'trans-render/lib/lispToCamel.js';
export class ObjML extends HTMLElement {
    connectedCallback(){
        this.doFullMerge();
        this.addMutationObserver();
        this.addEventListeners();
    }
    async doFullMerge(){
        const obj: any = {};
        for(const attrib of this.attributes){
            assignAttr(obj, attrib);
        }
        for(const child of this.children){
            const oChild = child as ObjML;
            const name = oChild.getAttribute("name");
            if(name === null) continue;
            if(obj[name] !== undefined){
                if(!Array.isArray(obj[name])){
                    obj[name] = [obj[name]];
                }
                obj[name].push(oChild.value);
            }else{
                obj[name] = oChild.value;
            }
            
        }
        this.value = obj;
    }

    _value: any;
    get value(){
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
        }))
    }

    onMutation(mutationsList: MutationRecord[], observer: MutationObserver){
        for(const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const addedNodes = mutation.addedNodes;
                for(const oChild of addedNodes){
                    if(!(oChild instanceof ObjML) && !(oChild instanceof HTMLInputElement)) continue;
                    const name = oChild.getAttribute("name");
                    if(name === null) continue;
                    this.setVal(name, oChild);
                }
                
            }
            else if (mutation.type === 'attributes') {
                const name = mutation.attributeName!;
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
        const config = { attributes: true, childList: true, subtree: false };
        const callBack = this.onMutation.bind(this);
        this._observer = new MutationObserver(callBack);
        this._observer.observe(this, config);
    }

    handleEvent = (e: Event) => {
        const target = e.target as ObjML | HTMLInputElement;
        if(target=== null) return; 
        const name = target.getAttribute('name');
        if(name === null || target.parentElement !== this) return;
        e.stopPropagation();
        this._propLastChanged = name;
        this.setVal(name, target);
        //this.value[name] = target.value;
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
    const posOfFirstDash = name.lastIndexOf('-');
    let type = 'str';
    let propName = name;
    if(posOfFirstDash !== -1) {
        type = name.substr(posOfFirstDash + 1);
        propName = lispToCamel(name.substr(0, posOfFirstDash));
    }
    const val = attrib.value;
    switch(type){
        case 'str':
            obj[propName] = val;
            break;
        case 'bool':
            obj[propName] = val === 'true';
            break;
        case 'int':
            obj[propName] = parseInt(val);
            break;
        case 'obj':
            obj[propName] = JSON.parse(val);
            break;
        case 'date':
            obj[propName] = new Date(Date.parse(val));
            break;
        case 'float':
            obj[propName] = parseFloat(val);
            break;
        default:
            propName = lispToCamel(name);
            obj[propName] = val;
    }
    
}
customElements.define('obj-ml', ObjML);

declare global {
    interface HTMLElementTagNameMap {
        "obj-ml": ObjML,
    }
}