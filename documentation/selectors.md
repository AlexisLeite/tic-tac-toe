# Selectors

## Selector

### Properties:

The Selector component will be used to select an item from a list. The list must be provided through the options property and it can be an array of any contents.

In order to find out what value to show to the user, it accepts a map property which must be a function. This funcion will be called on each options' item to get the correct jsx.

When the user selects a new value, the component will notice the parent through the onChange event, and will pass as arguments the index of the selected item and its value.

It can be controlled through the value property in order to set what item it must show to the user.

Additionally, it accepts a className property which will be put into the selector tag, allowing the developer to style it

```jsx
    className: "",
    map: (value) => value,
    onChange: (index, value) => {},
    options: [],
    value: 0,
```
