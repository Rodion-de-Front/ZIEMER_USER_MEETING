import { useEffect, useRef, useState } from 'react'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'
import { Loader } from './Loader'

GlobalWorkerOptions.workerSrc = pdfWorkerUrl

function PdfPage({ document, number, total, errorLabel }) {
  const pageRef = useRef(null)
  const canvasRef = useRef(null)
  const [shouldRender, setShouldRender] = useState(number === 1)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (shouldRender || !pageRef.current) return undefined
    if (!window.IntersectionObserver) {
      setShouldRender(true)
      return undefined
    }
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true)
          observer.disconnect()
        }
      },
      { rootMargin: '700px 0px' },
    )
    observer.observe(pageRef.current)
    return () => observer.disconnect()
  }, [shouldRender])

  useEffect(() => {
    if (!shouldRender) return undefined

    let disposed = false
    let generation = 0
    let renderTask = null
    let resizeFrame = 0

    const renderPage = async () => {
      const currentGeneration = ++generation
      renderTask?.cancel()
      try {
        const page = await document.getPage(number)
        if (disposed || currentGeneration !== generation) return
        const wrapper = pageRef.current
        const canvas = canvasRef.current
        if (!wrapper || !canvas) return

        const baseViewport = page.getViewport({ scale: 1 })
        const availableWidth = Math.max(1, wrapper.clientWidth)
        const viewport = page.getViewport({
          scale: availableWidth / baseViewport.width,
        })
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = Math.floor(viewport.width * pixelRatio)
        canvas.height = Math.floor(viewport.height * pixelRatio)
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`
        renderTask = page.render({
          canvas,
          viewport,
          transform:
            pixelRatio === 1 ? undefined : [pixelRatio, 0, 0, pixelRatio, 0, 0],
        })
        await renderTask.promise
        if (!disposed) setFailed(false)
      } catch (error) {
        if (!disposed && error?.name !== 'RenderingCancelledException') {
          setFailed(true)
        }
      }
    }

    const scheduleRender = () => {
      window.cancelAnimationFrame(resizeFrame)
      resizeFrame = window.requestAnimationFrame(renderPage)
    }
    const resizeObserver = window.ResizeObserver
      ? new window.ResizeObserver(scheduleRender)
      : null
    if (pageRef.current) resizeObserver?.observe(pageRef.current)
    if (!resizeObserver) window.addEventListener('resize', scheduleRender)
    renderPage()

    return () => {
      disposed = true
      generation += 1
      renderTask?.cancel()
      resizeObserver?.disconnect()
      if (!resizeObserver) window.removeEventListener('resize', scheduleRender)
      window.cancelAnimationFrame(resizeFrame)
    }
  }, [document, errorLabel, number, shouldRender])

  return (
    <article className="pdf-document-page" ref={pageRef}>
      {shouldRender && <canvas ref={canvasRef} />}
      {!shouldRender && <span className="pdf-page-placeholder" aria-hidden="true" />}
      {failed && <p role="alert">{errorLabel}</p>}
      <span className="pdf-page-number">{number} / {total}</span>
    </article>
  )
}

export function PdfDocumentViewer({ src, loadingLabel, errorLabel }) {
  const [document, setDocument] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let disposed = false
    const loadingTask = getDocument(src)
    setDocument(null)
    setFailed(false)

    loadingTask.promise
      .then((loadedDocument) => {
        if (!disposed) setDocument(loadedDocument)
      })
      .catch(() => {
        if (!disposed) setFailed(true)
      })

    return () => {
      disposed = true
      loadingTask.destroy()
    }
  }, [src])

  if (failed) return <p className="pdf-document-status" role="alert">{errorLabel}</p>
  if (!document) return <div className="pdf-document-status"><Loader label={loadingLabel} variant="panel" /></div>

  return (
    <div className="pdf-document-pages">
      {Array.from({ length: document.numPages }, (_, index) => (
        <PdfPage
          document={document}
          errorLabel={errorLabel}
          key={index + 1}
          number={index + 1}
          total={document.numPages}
        />
      ))}
    </div>
  )
}
