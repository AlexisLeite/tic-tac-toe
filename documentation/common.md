# Common

The common module offers several methods used in the whole application. It's main objective is to reduce the ammount of code, unify the criteria along the code and keep it simple to understand and scale whenever it would be necessary.

The available methods are:

## api(route):URL

returns an URL pointing to the game api's specified subroute. It provides the centralization needed whenever a host change will be made.

## asDebugable(thisObject)

It will set the debug method which allows to set a debug level which will be compared with the current debug level of the thisObject and output it to the console only if it's allowed.

## consoleAccess(name, obj)

It will set the specified object under the specified name in order to gain access from the console. The advantage of using this method is that the whole application will output methods and properties to the console through the same bottleneck, providing the developer with total control of when to allow it or not.

## env(sufix):any

It is a shortcut to REACT*APP*${sufix}

## exists(obj,route,callback):property

It will chech if the route is abailable within the object and return its value, at the same time it will call the callback provided with the property as argument.

## EasyEvents

Is a function which must be called with the .call(this) sufix and provides an easy-to-setup events generator. Through the addEvents(['array','of','events']) it will setup the 'onArray', 'offArray', 'onRegisterArray' and 'fireArray' methods (the same to 'of', and 'events' in this case) used in order to: suscribe, unsuscribe, get alerted when someone suscribes and dispatch an event.

## hashes(length):array

It returns an array of random in hashes with the specified length.

## MultiStage:functionComponent

It accepts a stages property which defines what element should be shown in every moment. **The stages property** must be an array of definitions. **Each definition** must be an array compounded as follows: [condition, rendering]. **The condition** can be a true for rendering. **The rendering** must be any React render element.

## required(name):void

It's used as a default function parameter. If no parameter is assigned, it will throw an error showing the parameter's name (it must be passed as argument). Example: function showName(name = required("Name")){}

## loadTranslates():void

It will load the translations table from the server on the first load in order to prevent the translate function from calling the server each time a translation is needed.

## translate(stringPhrase):string

This function queries on a local translations table and if it provides a translation for the phrase returns it. Else it will query the server for this translation in order to obtain one, if no translation is provided it returns the original phrase. It's necessary to notice that the server will be able to register a non translated phrase when this method queries it.

## ucFirst(string):string

It sets the first character to uppercase and return the string.
