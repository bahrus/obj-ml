import {lispToCamel} from 'trans-render/lib/lispToCamel.js';
export class ObjML extends HTMLElement {
    connectedCallback(){
        this.style.display = 'none';
        this.doFullMerge();
    }
    async doFullMerge(){
        const obj = {};
        for(const attrib of this.attributes){
            assignAttr(obj, attrib);
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
            detail:{
                value: nv,
            }
        }))
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

    }
    
}
customElements.define('obj-ml', ObjML);