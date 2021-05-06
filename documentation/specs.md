# Modal

The modal is a dialog box that can be used to show any element. When it's closed it fires an event **hasClosed()** giving its parent the opportunity to update the show property to _false_. It's very important thua the modal will show again only when show property change from false to true again.

## Usage

```jsx
  <button onClick={()=>{
    this.setState({
      showModal: true
    })
  }}>Abrir cuadro de suscripción</button>
  
  <Modal onClose={()=>{setState({showModal:false})}}
    show={this.state.showModal}
    title="Suscríbete">
      Te enviaremos contenido genial...
      <button onClick={this.susvribe}>Suscribe</button>
  </Modal>
```

## Avoid user closing

You can set the canClose property to false in order to prevent the user from cklosing the modal.

## Available properties

- **id** set the modal id
- **className** sets an aditional class name to the modal
- **textAlign** set the text alignment
