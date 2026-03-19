'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  Upload, 
  Loader2, 
  FileText, 
  Brain,
  RefreshCw,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Save,
  X
} from 'lucide-react'

interface OCRReaderProps {
  usuarioId: string
  onSave?: () => void
}

interface OCRResult {
  text: string
  totalEntradas?: string
  totalSaidas?: string
  processingTime?: number
}

export default function OCRReader({ usuarioId, onSave }: OCRReaderProps) {
  const [image, setImage] = useState<string | null>(null)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera')
  const [imageWithOverlay, setImageWithOverlay] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Criar imagem com tarja sobreposta
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
      
      // Data/Hora
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
      
      // Tempo IA
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
      
      // Entradas
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
      
      // Saídas
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

  // Iniciar câmera
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
      alert('Não foi possível acessar a câmera.')
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
    if (!image) return
    
    setIsLoading(true)
    const startTime = Date.now()
    
    try {
      const base64Data = image.split(',')[1]
      const mimeType = image.split(';')[0].split(':')[1]
      
      const response = await fetch('/api/ocr-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType,
        }),
      })
      
      const data = await response.json()
      const endTime = Date.now()
      const processingTime = (endTime - startTime) / 1000
      
      if (data.success) {
        setOcrResult({
          text: data.text || '',
          totalEntradas: data.totalEntradas,
          totalSaidas: data.totalSaidas,
          processingTime,
        })
      } else {
        setOcrResult({ text: '', processingTime })
      }
    } catch (error) {
      console.error('Erro:', error)
      setOcrResult({ text: '' })
    } finally {
      setIsLoading(false)
    }
  }, [image])

  const newPhoto = useCallback(() => {
    setImage(null)
    setImageWithOverlay(null)
    setOcrResult(null)
    if (activeTab === 'camera') {
      startCamera()
    }
  }, [activeTab, startCamera])

  const handleTabChange = useCallback((tab: 'camera' | 'upload') => {
    setActiveTab(tab)
    if (tab === 'camera') {
      startCamera()
    } else {
      stopCamera()
    }
  }, [startCamera, stopCamera])

  const sendToWhatsApp = useCallback(async () => {
    if (!imageWithOverlay) return

    try {
      const response = await fetch(imageWithOverlay)
      const blob = await response.blob()
      const file = new File([blob], 'ocr-leitura.jpg', { type: 'image/jpeg' })

      const message = `ENTRADAS: ${ocrResult?.totalEntradas || '--'}\nSAÍDAS: ${ocrResult?.totalSaidas || '--'}`

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'OCR Leitura', text: message })
      } else {
        const encodedMessage = encodeURIComponent(message)
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank')
      }
    } catch (error) {
      console.error('Erro:', error)
    }
  }, [imageWithOverlay, ocrResult])

  const saveReading = useCallback(async () => {
    if (!ocrResult || !imageWithOverlay) return

    setSaving(true)
    try {
      const response = await fetch('/api/leituras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId,
          entrada: parseFloat(ocrResult.totalEntradas?.replace(/[^\d.,]/g, '').replace(',', '.') || '0'),
          saida: parseFloat(ocrResult.totalSaidas?.replace(/[^\d.,]/g, '').replace(',', '.') || '0'),
          imagem: imageWithOverlay,
          tempoProcessamento: ocrResult.processingTime,
        }),
      })

      if (response.ok) {
        alert('Leitura salva com sucesso!')
        onSave?.()
        newPhoto()
      } else {
        alert('Erro ao salvar leitura')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar leitura')
    } finally {
      setSaving(false)
    }
  }, [ocrResult, imageWithOverlay, usuarioId, onSave, newPhoto])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Nova Leitura OCR
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tabs */}
          {!image && (
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'camera' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => handleTabChange('camera')}
              >
                <Camera className="w-4 h-4 mr-2" />
                Câmera
              </Button>
              <Button
                variant={activeTab === 'upload' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => handleTabChange('upload')}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          )}

          {/* Área de captura */}
          {!image ? (
            <div className="aspect-[4/3] relative bg-slate-900 rounded-lg overflow-hidden">
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
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-16 h-16 text-slate-400 mb-4" />
                  <p className="text-slate-400">Toque para selecionar uma imagem</p>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[4/3] relative bg-slate-100 rounded-lg overflow-hidden">
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

          <canvas ref={canvasRef} className="hidden" />
          <canvas ref={overlayCanvasRef} className="hidden" />

          {/* Botões */}
          {image && (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={newPhoto}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button className="flex-1" onClick={processWithAI} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                Extrair Leitura
              </Button>
            </div>
          )}

          {/* Valores extraídos */}
          {ocrResult && (ocrResult.totalEntradas || ocrResult.totalSaidas) && (
            <Card className="border-2 border-red-500">
              <CardHeader className="pb-2 bg-red-600">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Valores Extraídos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-3">
                  {ocrResult.totalEntradas && (
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 p-1.5 rounded-full">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Entradas</p>
                        <p className="font-bold text-green-600">{ocrResult.totalEntradas}</p>
                      </div>
                    </div>
                  )}
                  {ocrResult.totalSaidas && (
                    <div className="flex items-center gap-2">
                      <div className="bg-red-100 p-1.5 rounded-full">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Saídas</p>
                        <p className="font-bold text-red-600">{ocrResult.totalSaidas}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões de ação */}
          {ocrResult && imageWithOverlay && (
            <div className="flex gap-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={sendToWhatsApp} disabled={isLoading}>
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button className="flex-1" onClick={saveReading} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
