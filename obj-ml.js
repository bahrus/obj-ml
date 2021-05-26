import { lispToCamel } from 'trans-render/lib/lispToCamel.js';
export class ObjML extends HTMLElement {
    connectedCallback() {
        this.style.display = 'none';
        this.doFullMerge();
        this.addMutationObserver();
    }
    async doFullMerge() {
        const obj = {};
        for (const attrib of this.attributes) {
            assignAttr(obj, attrib);
        }
        for (const child of this.children) {
            if (child)
                ;
        }
        this.value = obj;
    }
    _value;
    get value() {
        return this._value;
    }
    set value(nv) {
        this._value = nv;
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: nv,
                propLastChanged: this._propLastChanged
            }
        }));
    }
    onMutation(mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                //console.log('A child node has been added or removed.');
                //TODO
            }
            else if (mutation.type === 'attributes') {
                const name = mutation.attributeName;
                const obj = this.value || {};
                assignAttr(obj, this.getAttributeNode(name)); //TODO:  remove attribute?
                this._propLastChanged = name;
                this.value = obj;
            }
        }
    }
    _observer;
    _propLastChanged;
    addMutationObserver() {
        const config = { attributes: true, childList: true, subtree: false };
        const callBack = this.onMutation.bind(this);
        this._observer = new MutationObserver(callBack);
        this._observer.observe(this, config);
    }
    disconnectedCallback() {
        if (this._observer !== undefined) {
            this._observer.disconnect();
        }
    }
}
function assignAttr(obj, attrib) {
    const name = attrib.name;
    const posOfFirstDash = name.lastIndexOf('-');
    let type = 'str';
    let propName = name;
    if (posOfFirstDash !== -1) {
        type = name.substr(posOfFirstDash + 1);
        propName = lispToCamel(name.substr(0, posOfFirstDash));
    }
    const val = attrib.value;
    switch (type) {
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
