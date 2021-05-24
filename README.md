# obj-ml

Syntax:

```html
<obj-ml str-prop1='string property' bool-prop2=true int-prop3=5 float-prop4=2.7 date-prop5="May 24, 2021" obj-prop6='{"mySubSubObj":"hello"}'></obj-ml>
```

Forms an JavaScript Object:

```JSON
{
    "prop1": "string property"
    ...
}
```

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