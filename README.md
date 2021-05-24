# obj-ml [TODO]

## Priors

Given the fact that (to quote a colleague) "everything that will ever be discovered is already there, buried in github somewhere", I'm sure there are lots of competing versions of this.

I don't even want to look, it's too depressing.

Anyway, obj-ml is inspired by the native DOM "datalist" element.

Syntax:

```html
<obj-ml str-prop1='string property' bool-prop2=true int-prop3=5 flt-prop4=2.7 date-prop5="May 24, 2021" obj-prop6='{"mySubSubObj":"hello"}'></obj-ml>
```

Results in creating a JavaScript object:

```JSON
{
    "prop1": "string property"
    ...
}
```

[TODO]  Is there such a thing as a POWO (plain old wasm object)?

... and setting property "value" to that JavaScript object.  Event "value-changed" is fired as the Object changes.  The value is passed in the detail, as well as some indication of what part of the object changed.

Property names are derived by "camelCasing" the name after the type prefix.  obj- prefix means use JSON.parse on the attribute (and arrays are objects).

Property "value" of the obj-ml is set to this object.

## Nested obj-ml's.

```html
<obj-ml>
    <obj-ml name='subObj' str-prop1='string property'></obj-ml>
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
    <obj-ml name='subObj' str-prop1='string property'></obj-ml>
    <obj-ml name='subObj' num-prop2=42></obj-ml>
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

The advantage of nesting like this, as opposed to using the flat attribute/JSON parse, is changes to the object can be more thoroughly described in the event that is passed.  The disadvantage is probably more memory is used.