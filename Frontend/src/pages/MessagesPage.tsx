function MessagesPage() {
  return (
    <section className="flow-page messages-page">
      <article className="chat-card">
        <header className="chat-header">
          <div>
            <h2>Lic. Alejandro Valenzuela</h2>
            <p>Colegiado 28/4092</p>
          </div>
          <button type="button" className="outline-button">
            Finalizar tramite
          </button>
        </header>
        <p className="chat-privacy">
          Privacidad: los mensajes se eliminaran al finalizar el tramite.
        </p>
        <div className="chat-thread">
          <article className="bubble bubble-in">
            Hola, revise el borrador inicial de su testamento. Confirmo incluir
            la clausula de desheredacion para el inmueble en Madrid?
            <span>10:47 AM</span>
          </article>
          <article className="bubble bubble-out">
            Buenos dias, licenciado. Si, por favor proceda con la clausula tal
            como lo discutimos por telefono.
            <span>10:52 AM</span>
          </article>
          <article className="bubble bubble-in file-bubble">
            Entendido. Actualice el documento. Revise el PDF adjunto y confirme
            si esta correcto para proceder con cita presencial.
            <div className="pdf-row">
              <strong>Borrador_Testamento_Mendoza.pdf</strong>
              <button type="button" className="outline-button tiny-button">
                Descargar PDF
              </button>
            </div>
            <span>11:05 AM</span>
          </article>
        </div>
        <footer className="chat-input-row">
          <input type="text" placeholder="Escribe tu mensaje para el notario" />
          <button type="button" className="circle-button" aria-label="Enviar mensaje">
            {'>'}
          </button>
        </footer>
      </article>
    </section>
  )
}

export default MessagesPage
