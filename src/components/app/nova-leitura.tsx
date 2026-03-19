'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Camera,
  Upload,
  Loader2,
  FileText,
  RefreshCw,
  Image as ImageIcon,
  Check,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react'

interface Maquina {
  codigo: number
  nome: string
  tipo: {
    codigo: number
    descricao: string
    campoEntrada: string
    campoSaida: string
  }
  moeda: string
}

interface Local {
  codigo: number
  nome: string
}

interface NovaLeituraProps {
  onBack: () => void
}

export function NovaLeitura({ onBack }: NovaLeituraProps) {
  const [maquinas, setMaquinas] = useState<Maquina[]>([])
  const [locais, setLocais] = useState<Local[]>([])
  const [selectedMaquina, setSelectedMaquina] = useState<string>('')
  const [selectedLocal, setSelectedLocal] = useState<string>('')
  const [image, setImage] = useState<string | null>(null)
  const [imageWithOverlay, setImageWithOverlay] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera')
  const [ocrResult, setOcrResult] = useState<{
    entrada: number
    saida: number
    tempoProcessamento: number
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Load maquinas and locais
  useEffect(() => {
    const loadData = async () => {
      try {
        const [maquinasRes, locaisRes] = await Promise.all([
          fetch('/api/maquinas'),
          fetch('/api/locais'),
        ])
        const maquinasData = await maquinasRes.json()
        const locaisData = await locaisRes.json()
        setMaquinas(maquinasData.filter((m: Maquina & { ativo: boolean }) => m.ativo !== false))
        setLocais(locaisData.filter((l: Local & { ativo: boolean }) => l.ativo !== false))
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    }
    loadData()
  }, [])

  // Start camera on mount
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera()
    }
    return () => stopCamera()
  }, [activeTab])

  // Create image with overlay
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

      const timeStr2 = ocrResult?.tempoProcessamento ? `${ocrResult.tempoProcessamento.toFixed(1)}s` : '--'

      ctx.textAlign = 'center'
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 39px Arial'
      ctx.fillText('TEMPO IA', padding + sectionWidth + sectionWidth / 2, textY - 32)

      ctx.fillStyle = '#FEF3C7'
      ctx.font = 'bold 58px Arial'
      ctx.fillText(timeStr2, padding + sectionWidth + sectionWidth / 2, textY + 15)

      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(padding + sectionWidth * 2, y + 12)
      ctx.lineTo(padding + sectionWidth * 2, y + barHeight - 12)
      ctx.stroke()

      const maquina = maquinas.find((m) => m.codigo.toString() === selectedMaquina)
      const moeda = maquina?.moeda || 'R$'
      const entradasValue = ocrResult?.entrada
        ? `${moeda} ${ocrResult.entrada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : '--'

      ctx.textAlign = 'center'
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 39px Arial'
      ctx.fillText('ENTRADAS', padding + sectionWidth * 2 + sectionWidth / 2, textY - 32)

      ctx.fillStyle = '#FEF3C7'
      ctx.font = 'bold 42px Arial'
      ctx.fillText(entradasValue, padding + sectionWidth * 2 + sectionWidth / 2, textY + 15)

      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(padding + sectionWidth * 3, y + 12)
      ctx.lineTo(padding + sectionWidth * 3, y + barHeight - 12)
      ctx.stroke()

      const saidasValue = ocrResult?.saida
        ? `${moeda} ${ocrResult.saida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : '--'

      ctx.textAlign = 'center'
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 39px Arial'
      ctx.fillText('SAÍDAS', padding + sectionWidth * 3 + sectionWidth / 2, textY - 32)

      ctx.fillStyle = '#FEF3C7'
      ctx.font = 'bold 42px Arial'
      ctx.fillText(saidasValue, padding + sectionWidth * 3 + sectionWidth / 2, textY + 15)

      setImageWithOverlay(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.src = image
  }, [image, ocrResult, maquinas, selectedMaquina])

  const startCamera = useCallback(async () => {
    try {
      stopCamera()
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error)
      setActiveTab('upload')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
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
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const processWithAI = useCallback(async () => {
    if (!image || !selectedMaquina) {
      alert('Selecione uma máquina e capture uma imagem')
      return
    }

    setIsLoading(true)
    const startTime = Date.now()

    try {
      const response = await fetch('/api/leituras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maquinaId: parseInt(selectedMaquina),
          localId: selectedLocal ? parseInt(selectedLocal) : null,
          imagem: image,
          processarOCR: true,
        }),
      })

      const data = await response.json()
      const endTime = Date.now()
      const processingTime = (endTime - startTime) / 1000

      if (data.success) {
        setOcrResult({
          entrada: data.entrada || 0,
          saida: data.saida || 0,
          tempoProcessamento: processingTime,
        })
      } else {
        setOcrResult({
          entrada: 0,
          saida: 0,
          tempoProcessamento: processingTime,
        })
        alert(data.error || 'Erro ao processar OCR')
      }
    } catch (error) {
      console.error('Erro no processamento:', error)
      const endTime = Date.now()
      setOcrResult({
        entrada: 0,
        saida: 0,
        tempoProcessamento: (endTime - startTime) / 1000,
      })
    } finally {
      setIsLoading(false)
    }
  }, [image, selectedMaquina, selectedLocal])

  const confirmReading = useCallback(async () => {
    if (!image || !selectedMaquina || !ocrResult) return

    setIsSaving(true)
    try {
      // Already saved in processWithAI, just show success
      alert('Leitura salva com sucesso!')
      resetForm()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar leitura')
    } finally {
      setIsSaving(false)
    }
  }, [image, selectedMaquina, ocrResult])

  const sendToWhatsApp = useCallback(async () => {
    if (!imageWithOverlay) return

    try {
      const response = await fetch(imageWithOverlay)
      const blob = await response.blob()
      const file = new File([blob], 'leitura.jpg', { type: 'image/jpeg' })

      const maquina = maquinas.find((m) => m.codigo.toString() === selectedMaquina)
      const moeda = maquina?.moeda || 'R$'
      const message = `📊 LEITURA\nMáquina: ${maquina?.nome || 'N/A'}\nEntrada: ${moeda} ${ocrResult?.entrada?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '--'}\nSaída: ${moeda} ${ocrResult?.saida?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '--'}`

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Leitura',
          text: message,
        })
      } else {
        const encodedMessage = encodeURIComponent(message)
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank')
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
    }
  }, [imageWithOverlay, ocrResult, maquinas, selectedMaquina])

  const resetForm = useCallback(() => {
    setImage(null)
    setImageWithOverlay(null)
    setOcrResult(null)
    setSelectedMaquina('')
    setSelectedLocal('')
    if (activeTab === 'camera') {
      startCamera()
    }
  }, [activeTab, startCamera])

  const newPhoto = useCallback(() => {
    setImage(null)
    setImageWithOverlay(null)
    setOcrResult(null)
    if (activeTab === 'camera') {
      startCamera()
    }
  }, [activeTab, startCamera])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-20">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-blue-600">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Nova Leitura</h1>
          <p className="text-white/80 text-sm">Capture e processe com OCR</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Seleções */}
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Máquina *</Label>
            <Select value={selectedMaquina} onValueChange={setSelectedMaquina}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a máquina" />
              </SelectTrigger>
              <SelectContent>
                {maquinas.map((m) => (
                  <SelectItem key={m.codigo} value={m.codigo.toString()}>
                    {m.codigo.toString().padStart(5, '0')} - {m.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Local (opcional)</Label>
            <Select value={selectedLocal} onValueChange={setSelectedLocal}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o local" />
              </SelectTrigger>
              <SelectContent>
                {locais.map((l) => (
                  <SelectItem key={l.codigo} value={l.codigo.toString()}>
                    {l.codigo.toString().padStart(5, '0')} - {l.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'camera' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setActiveTab('camera')}
          >
            <Camera className="w-4 h-4 mr-2" />
            Câmera
          </Button>
          <Button
            variant={activeTab === 'upload' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => {
              setActiveTab('upload')
              stopCamera()
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        {/* Área de captura/upload */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {!image ? (
              <div className="aspect-[4/3] relative bg-slate-900">
                {activeTab === 'camera' ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
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
                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-16 h-16 text-slate-400 mb-4" />
                    <p className="text-slate-400 text-center px-4">
                      Toque para selecionar uma imagem
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[4/3] relative bg-slate-100">
                <img
                  src={imageWithOverlay || image}
                  alt="Imagem capturada"
                  className="w-full h-full object-contain"
                />
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

        {/* Canvas oculto */}
        <canvas ref={canvasRef} className="hidden" />
        <canvas ref={overlayCanvasRef} className="hidden" />

        {/* Botões de ação */}
        {image && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={newPhoto}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Nova Foto
              </Button>
              <Button
                className="flex-1"
                onClick={processWithAI}
                disabled={isLoading || !selectedMaquina}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                Extrair Leitura
              </Button>
            </div>

            {ocrResult && (
              <>
                <Button
                  className="w-full"
                  onClick={confirmReading}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Confirmar Leitura
                </Button>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={sendToWhatsApp}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Enviar pelo WhatsApp
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex justify-around py-2">
          <Button
            variant="ghost"
            className="flex flex-col items-center h-auto py-2 px-3 text-blue-500"
          >
            <Camera className="w-5 h-5" />
            <span className="text-xs mt-1">Leitura</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center h-auto py-2 px-3"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs mt-1">Voltar</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
