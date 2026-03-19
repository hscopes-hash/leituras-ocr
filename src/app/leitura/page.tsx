'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { 
  Camera, 
  Upload, 
  Loader2, 
  FileText, 
  RefreshCw,
  Image as ImageIcon,
  MessageCircle,
  ArrowLeft,
  Check
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Maquina {
  id: string
  codigo: number
  nome: string
  tipo: {
    codigo: number
    descricao: string
    campoEntrada: string
    campoSaida: string
  }
}

interface Local {
  id: string
  codigo: number
  nome: string
  adicional?: string | null
  percentual: number
}

interface OCRResult {
  text: string
  totalEntradas?: string
  totalSaidas?: string
  processingTime?: number
}

export default function LeituraPage() {
  const router = useRouter()
  const [image, setImage] = useState<string | null>(null)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [imageWithOverlay, setImageWithOverlay] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera')
  const [salvo, setSalvo] = useState<boolean>(false)
  
  const [maquinas, setMaquinas] = useState<Maquina[]>([])
  const [locais, setLocais] = useState<Local[]>([])
  const [maquinaSelecionada, setMaquinaSelecionada] = useState<string>('')
  const [localSelecionado, setLocalSelecionado] = useState<string>('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    const usuario = localStorage.getItem('usuario_logado')
    if (!usuario) {
      router.push('/')
      return
    }

    Promise.all([
      fetch('/api/maquinas').then(r => r.json()),
      fetch('/api/locais').then(r => r.json()),
    ]).then(([maquinasData, locaisData]) => {
      setMaquinas(maquinasData.maquinas || [])
      setLocais(locaisData.locais || [])
    })

    startCamera()
  }, [router])

  useEffect(() => {
    if (image) {
      createImageWithOverlay()
    } else {
      setImageWithOverlay(null)
    }
  }, [image, ocrResult])

  const createImageWithOverlay = useCallback(() => {
    if (!image || !overlayCanvasRef.current) return

    const canvas = overlayCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      
      ctx.drawImage(img, 0, 0)
      
      const padding = 10
      const barHeight = 140
      const y = img.height - barHeight - padding
      
      ctx.fillStyle = '#DC2626'
      ctx.fillRect(padding, y, img.width - padding * 2, barHeight)
      
      ctx.strokeStyle = '#B91C1C'
      ctx.lineWidth = 4
      ctx.strokeRect(padding, y, img.width - padding * 2, barHeight)
      
      ctx.textBaseline = 'middle'
      const textY = y + barHeight / 2
      const sectionWidth = (img.width - padding * 2) / 4
      
      const now = new Date()
      const dateStr = now.toLocaleDateString('pt-BR')
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      
      ctx.textAlign = 'center'
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 39px Arial'
      ctx.fillText('DATA/HORA', padding + sectionWidth / 2, textY - 32)
      
      ctx.fillStyle = '#FEF3C7'
      ctx.font = 'bold 43px Arial'
      ctx.fillText(dateStr, padding + sectionWidth / 2, textY + 10)
      ctx.font = '39px Arial'
      ctx.fillText(timeStr, padding + sectionWidth / 2, textY + 55)
      
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(padding + sectionWidth, y + 12)
      ctx.lineTo(padding + sectionWidth, y + barHeight - 12)
      ctx.stroke()
      
      const timeStr2 = ocrResult?.processingTime ? `${ocrResult.processingTime.toFixed(1)}s` : '--'
      
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 39px Arial'
      ctx.fillText('TEMPO IA', padding + sectionWidth + sectionWidth / 2, textY - 32)
      
      ctx.fillStyle = '#FEF3C7'
      ctx.font = 'bold 58px Arial'
      ctx.fillText(timeStr2, padding + sectionWidth + sectionWidth / 2, textY + 15)
      
      ctx.strokeStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.moveTo(padding + sectionWidth * 2, y + 12)
      ctx.lineTo(padding + sectionWidth * 2, y + barHeight - 12)
      ctx.stroke()
      
      const entradasValue = ocrResult?.totalEntradas || '--'
      
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 39px Arial'
      ctx.fillText('ENTRADAS', padding + sectionWidth * 2 + sectionWidth / 2, textY - 32)
      
      ctx.fillStyle = '#FEF3C7'
      ctx.font = 'bold 49px Arial'
      ctx.fillText(entradasValue, padding + sectionWidth * 2 + sectionWidth / 2, textY + 15)
      
      ctx.strokeStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.moveTo(padding + sectionWidth * 3, y + 12)
      ctx.lineTo(padding + sectionWidth * 3, y + barHeight - 12)
      ctx.stroke()
      
      const saidasValue = ocrResult?.totalSaidas || '--'
      
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 39px Arial'
      ctx.fillText('SAÍDAS', padding + sectionWidth * 3 + sectionWidth / 2, textY - 32)
      
      ctx.fillStyle = '#FEF3C7'
      ctx.font = 'bold 49px Arial'
      ctx.fillText(saidasValue, padding + sectionWidth * 3 + sectionWidth / 2, textY + 15)
      
      setImageWithOverlay(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.src = image
  }, [image, ocrResult])

  const startCamera = useCallback(async () => {
    try {
      stopCamera()
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        setImage(imageData)
        setOcrResult(null)
        setSalvo(false)
        stopCamera()
      }
    }
  }, [stopCamera])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imgData = e.target?.result as string
        setImage(imgData)
        setOcrResult(null)
        setSalvo(false)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // Função para comprimir imagem
  const compressImage = useCallback((dataUrl: string, maxWidth: number = 1280, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Redimensionar se necessário
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = dataUrl
    })
  }, [])

  const processWithAI = useCallback(async () => {
    if (!image) return
    
    setIsLoading(true)
    const startTime = Date.now()
    
    try {
      // Comprimir imagem antes de enviar
      console.log('Comprimindo imagem...')
      const compressedImage = await compressImage(image)
      console.log('Imagem comprimida, tamanho:', compressedImage.length)
      
      const base64Data = compressedImage.split(',')[1]
      const mimeType = compressedImage.split(';')[0].split(':')[1]
      
      console.log('Enviando para API OCR...')
      const response = await fetch('/api/ocr-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType,
        }),
      })
      
      const data = await response.json()
      console.log('Resposta da API:', data)
      const endTime = Date.now()
      const processingTime = (endTime - startTime) / 1000
      
      if (data.success) {
        setOcrResult({
          text: data.text || '',
          totalEntradas: data.totalEntradas,
          totalSaidas: data.totalSaidas,
          processingTime: data.processingTime || processingTime,
        })
      } else {
        console.error('Erro retornado pela API:', data.error)
        alert('Erro: ' + (data.error || 'Erro desconhecido'))
        setOcrResult({ text: '', processingTime })
      }
    } catch (error) {
      console.error('Erro na API de IA:', error)
      alert('Erro de conexão: ' + (error instanceof Error ? error.message : String(error)))
      const endTime = Date.now()
      setOcrResult({ text: '', processingTime: (endTime - startTime) / 1000 })
    } finally {
      setIsLoading(false)
    }
  }, [image, compressImage])

  const novaFoto = useCallback(() => {
    setImage(null)
    setImageWithOverlay(null)
    setOcrResult(null)
    setSalvo(false)
    if (activeTab === 'camera') {
      startCamera()
    }
  }, [activeTab, startCamera])

  const salvarLeitura = useCallback(async () => {
    if (!imageWithOverlay || !maquinaSelecionada) {
      alert('Selecione uma máquina')
      return
    }

    const usuarioStr = localStorage.getItem('usuario_logado')
    if (!usuarioStr) {
      router.push('/')
      return
    }

    const usuario = JSON.parse(usuarioStr)

    try {
      const response = await fetch('/api/leituras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: usuario.id,
          maquinaCodigo: parseInt(maquinaSelecionada),
          localCodigo: localSelecionado ? parseInt(localSelecionado) : null,
          entrada: parseFloat(ocrResult?.totalEntradas?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
          saida: parseFloat(ocrResult?.totalSaidas?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
          imagem: imageWithOverlay,
          tempoProcessamento: ocrResult?.processingTime,
        }),
      })

      if (response.ok) {
        setSalvo(true)
        alert('Leitura salva com sucesso!')
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao salvar')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar leitura')
    }
  }, [imageWithOverlay, maquinaSelecionada, localSelecionado, ocrResult, router])

  const sendToWhatsApp = useCallback(async () => {
    if (!imageWithOverlay) return

    try {
      const response = await fetch(imageWithOverlay)
      const blob = await response.blob()
      const file = new File([blob], 'leitura.jpg', { type: 'image/jpeg' })

      const message = `ENTRADAS: ${ocrResult?.totalEntradas || '--'}\nSAÍDAS: ${ocrResult?.totalSaidas || '--'}`

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Leitura',
          text: message
        })
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
    }
  }, [imageWithOverlay, ocrResult])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Nova Leitura</h1>
          <p className="text-sm text-slate-500">Capture e processe com IA</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm">Máquina *</Label>
          <Select value={maquinaSelecionada} onValueChange={setMaquinaSelecionada}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {maquinas.map(m => (
                <SelectItem key={m.id} value={String(m.codigo)}>
                  {m.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm">Local</Label>
          <Select value={localSelecionado} onValueChange={setLocalSelecionado}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {locais.map(l => (
                <SelectItem key={l.id} value={String(l.codigo)}>
                  {l.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={activeTab === 'camera' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => { setActiveTab('camera'); startCamera() }}
        >
          <Camera className="w-4 h-4 mr-2" />
          Câmera
        </Button>
        <Button
          variant={activeTab === 'upload' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => { setActiveTab('upload'); stopCamera() }}
        >
          <Upload className="w-4 h-4 mr-2" />
          Arquivo
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {!image ? (
            <div className="aspect-[4/3] relative bg-slate-900">
              {activeTab === 'camera' ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <Button
                    size="lg"
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full w-16 h-16"
                    onClick={capturePhoto}
                  >
                    <Camera className="w-6 h-6" />
                  </Button>
                </>
              ) : (
                <div 
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-16 h-16 text-slate-400 mb-4" />
                  <p className="text-slate-400">Toque para selecionar</p>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[4/3] relative bg-slate-100">
              <img src={imageWithOverlay || image} alt="Imagem" className="w-full h-full object-contain" />
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Processando IA...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={overlayCanvasRef} className="hidden" />

      {image && (
        <>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={novaFoto}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Nova
            </Button>
            <Button className="flex-1" onClick={processWithAI} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              Extrair Leitura
            </Button>
          </div>

          {ocrResult && (
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700" 
                onClick={salvarLeitura}
                disabled={salvo}
              >
                {salvo ? <Check className="w-4 h-4 mr-2" /> : null}
                {salvo ? 'Salvo!' : 'Salvar'}
              </Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={sendToWhatsApp}>
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
