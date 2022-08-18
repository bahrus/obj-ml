# obj-ml (WIP)

obj-ml (or o-m for short) is a web component that enables a declarative, HTML-based markup language to instantiate, and update, a lazy-loaded JavaScript object.

<a href="https://nodei.co/npm/obj-ml/"><img src="https://nodei.co/npm/obj-ml.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/obj-ml">

Use cases:  

1.  Provide a way to represent structured data that needs to be submitted with a post request, within a form element (or specifying a form target element.)
2.  Provides a place to pass data from, say, a form, which can then broadcast to other elements on the page via event subscription.
3.  Provides considerably more data types than JSON.
3.  Data can stream in as the HTML streams in.
4.  Querying the data with css/xpath now possible for free.
5.  XSLT can be used to generate the view off it.
6.  Can you use XSLT to "reverse engineer" server rendered HTML to obj-ml, essentially extracting the data out of the HTML sent to the browser.

## Syntax

```html
<obj-ml prop1='string property' prop2-bool prop3-int=5 prop4-float=2.7 prop5-date="May 24, 2021" prop6-obj='{"mySubSubObj":"hello"}'></obj-ml>
```

Results in creating a JavaScript object:

```JSON
{
    "prop1": "string property",
    "prop2": true,
    "prop3": 5,
    ... 
}
```


... and setting property "value" to that JavaScript object.  Event "value-changed" is fired as the value changes.  The value is passed in the detail, as well as some indication of what part of the object changed, when applicable.

An extending component, o-m, does the same thing as obj-ml, but the syntax will involve less typing, but is more likely to conflict with other web component names.

Also, for both obj-ml and o-m, the part of the attribute that specifies the type of the data can be abbreviated by the first letter, e.g. prop3-i, prop4-d, etc.

Property names are derived by "camelCasing" the attribute name before the type postfix.  -obj or -o postfix means use JSON.parse on the attribute (and arrays are objects).

If the property name is not a compound name, or if it ends with a non-recognized postfix, it is assumed to be a string property, and the entire name is camelCased to turn it into a property.

If you need a property to end with one of the reserved types, use it twice:

```html
<obj-ml root-beer-float-float=1.99></obj-ml>
```

## Attribute Changes

obj-ml watches for all attribute changes, and if one changes, it updates the "value", and an event is emitted, containing the name of the property that changed (e.detail.propLastChanged).

## Nested obj-ml's

```html
<obj-ml>
    <obj-ml itemprop='subObj' prop1='string property'></obj-ml>
    <input itemprop='myEditableProp'>
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

## Arrays

```html
<o-m my-list-arr>
    <o-m itemprop=myList prop1='string property'>
    <o-m itemprop=myList prop2-num=42>
</o-m>
```

The mere presence of the my-list-arr attribute starts an empty array, which will be filled if it happens to encounter any tags with itemprop=myList


The advantage of nesting like this, as opposed to using the flat attribute/JSON parse, is changes to the object can be more thoroughly described in the event that is passed.  

In addition, css / xpath queries can be done to filter the list.

The disadvantage may be that more memory is used (and more event listening).



## Form participation

obj-ml/o-l can partake in forms, becoming part of oForm.elements, formdata, etc.

It might make most sense to include outside the form, but integrate with the form via the form attribute:

```html
    <o-m form='form1' name='om' prop1='string property' prop2-b=true prop3-i=5 prop4-f=2.7 prop5-d="May 24, 2021" prop6-o='{"mySubSubObj":"hello"}'>
        <o-m itemprop='subObj' prop1='string property'></o-m>
        <input itemprop='myEditableProp'>
    </o-m>

    <form id='form1'>

    </form>
```

## Priors

A very likely non-exhaustive list:

1.  datalist
2.  Silverlight [XmlDataProvider](https://docs.microsoft.com/en-us/dotnet/desktop/wpf/data/how-to-bind-to-xml-data-using-an-xmldataprovider-and-xpath-queries?view=netframeworkdesktop-4.8)



[TODO]  Use itemref to reference another om element to incorporate repeating data.

## Viewing Your Element Locally

1.  Install node.
2.  Clone or for fork this git repo.
3.  In a command prompt from the folder of this git repo:

```
$ npm run serve
```

4.  Open browser to http://localhost/demo.