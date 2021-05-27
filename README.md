# obj-ml

<a href="https://nodei.co/npm/obj-ml/"><img src="https://nodei.co/npm/obj-ml.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/obj-ml">

## Syntax

```html
<obj-ml prop1='string property' prop2-bool=true prop3-int=5 prop4-float=2.7 prop5-date="May 24, 2021" prop6-obj='{"mySubSubObj":"hello"}'></obj-ml>
```

Results in creating a JavaScript object:

```JSON
{
    "prop1": "string property"
    ...
}
```


... and setting property "value" to that JavaScript object.  Event "value-changed" is fired as the value changes.  The value is passed in the detail, as well as some indication of what part of the object changed, when applicable.

[TODO]  Is there such a thing as a POWO (plain old wasm object)?

Property names are derived by "camelCasing" the name after the type postfix.  -obj postfix means use JSON.parse on the attribute (and arrays are objects).

If the property name is non component, or if it ends with a non-recognized postfix, it is assumed to be a string property, and the entire name is camelCased to turn it into a property.

If you need a property to end with one of the reserved types, use it twice:

```html
<obj-ml root-beer-float-float=1.99></obj-ml>
```

## Attribute Changes

obj-ml watches for all attribute changes, and if one changes, it updates the "value", and an event is emitted, containing the name of the property that changed (e.detail.propLastChanged).

## Nested obj-ml's

```html
<obj-ml>
    <obj-ml name='subObj' prop1-str='string property'></obj-ml>
    <input name='myEditableProp'>
</obj-ml>
```

results in outer obj-ml having value:

```JSON
{
    "subObj": {
        "prop1": "string property"
    }
}
```

If two or more children have the same name:

```html
<obj-ml>
    <obj-ml name='subObj' prop1-str='string property'></obj-ml>
    <obj-ml name='subObj' prop2-num=42></obj-ml>
</obj-ml>
```

...we end up with an array:

```JSON
{
    "subObj": [
        {
            "prop1": "string property"
        },
        {
            "prop2": 42
        }
    ]
}
```

The advantage of nesting like this, as opposed to using the flat attribute/JSON parse, is changes to the object can be more thoroughly described in the event that is passed.  The disadvantage may be that more memory is used (and more heavy handed mutation observing).

## Priors

Given the fact that (to quote a colleague) "everything that will ever be discovered is already there, buried in github somewhere", I'm sure there are lots of competing versions of this.

I don't even want to look, it's too depressing.

Anyway, obj-ml is inspired by the native DOM "datalist" element.