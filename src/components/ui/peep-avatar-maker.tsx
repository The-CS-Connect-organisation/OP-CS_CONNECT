import React, { useState, useRef } from 'react';
import PeepBase, {
  AccessoryType, FaceType, FacialHairType, HairType,
  BustPoseType, SittingPoseType, StandingPoseType
} from 'react-peeps';
const Peep = PeepBase as any;
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Camera, Save, RefreshCw, X } from 'lucide-react';
import { renderToString } from 'react-dom/server';

const accessories = ['None', 'Eyepatch', 'GlassRoundThick', 'Sunglasses', 'GlassAviator', 'GlassButterfly', 'GlassButterflyMac', 'GlassRoundMac', 'GlassSquare', 'GlassSquareMac', 'GlassSquareThick'] as const;
const faces = ['Smile', 'SmileBig', 'SmileTeeth', 'SmileTeethGap', 'Calm', 'Cheeky', 'Cute', 'Driven', 'Contempt', 'Explaining', 'Hectic', 'Blank', 'Old', 'Suspicious', 'AngryWithFang', 'Awe', 'Tired', 'Serious', 'Sad'] as const;
const facialHairs = ['None', 'Chin', 'Full', 'Full2', 'Full3', 'Full4', 'Goatee1', 'Goatee2', 'Moustache1', 'Moustache2', 'Moustache3', 'Moustache4', 'Moustache5', 'Moustache6', 'Moustache7', 'Moustache8', 'Moustache9'] as const;
const hairs = ['Bald', 'ShortVolumed', 'ShortWaved', 'ShortCurly', 'ShortCurlyDrop', 'ShortDreads', 'ShortDread1', 'ShortDread2', 'ShortFlat', 'ShortScratch', 'ShortPomp', 'ShortStraight', 'LongAfro', 'LongBangs', 'LongCurly', 'LongStraight', 'Medium1', 'Medium2', 'Medium3', 'MediumStraight', 'Buns', 'Cornrows', 'BunOutline'] as const;
const backgrounds = [
  '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
  '#fa709a', '#fee140', '#a18cd1', '#fbc2eb', '#fccb90', '#d57eeb',
  '#e0c3fc', '#8ec5fc', '#f5576c', '#ff6f91', '#30cfd0', '#330867',
  '#667db6', '#0082c8', '#11998e', '#38ef7d', '#fc5c7d', '#6a82fb',
  '#FFFFFF', '#1A1A1A'
];

interface PeepAvatarMakerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (avatarUrl: string) => void;
  initialAvatar?: string;
}

export function PeepAvatarMaker({ open, onOpenChange, onSave, initialAvatar }: PeepAvatarMakerProps) {
  const [accessory, setAccessory] = useState<any>('None');
  const [face, setFace] = useState<any>('Smile');
  const [hair, setHair] = useState<any>('ShortVolumed');
  const [facialHair, setFacialHair] = useState<any>('None');
  const [body, setBody] = useState<any>('Bust');
  const [bgColor, setBgColor] = useState(backgrounds[10]);
  const [isGenerating, setIsGenerating] = useState(false);

  const randomize = () => {
    setAccessory(accessories[Math.floor(Math.random() * accessories.length)]);
    setFace(faces[Math.floor(Math.random() * faces.length)]);
    setHair(hairs[Math.floor(Math.random() * hairs.length)]);
    setFacialHair(facialHairs[Math.floor(Math.random() * facialHairs.length)]);
    setBgColor(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
  };

  const handleSave = () => {
    setIsGenerating(true);
    try {
      const svgString = renderToString(
        <Peep
          style={{ width: '100%', height: '100%' }}
          accessory={accessory !== 'None' ? accessory : undefined}
          body={body}
          face={face}
          hair={hair !== 'Bald' ? hair : undefined}
          facialHair={facialHair !== 'None' ? facialHair : undefined}
          backgroundColor={bgColor}
          viewBox={{ x: '-50', y: '-50', width: '1050', height: '1050' }}
        />
      );

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        onSave(base64data as string);
        setIsGenerating(false);
      }
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[90vh] sm:h-[80vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Camera className="w-5 h-5" />
            Create Your Avatar
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Preview Area */}
          <div className="w-full md:w-5/12 bg-muted/30 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 transition-all duration-300 relative bg-white">
              <Peep
                style={{ width: '100%', height: '100%' }}
                accessory={accessory !== 'None' ? accessory : undefined}
                body={body}
                face={face}
                hair={hair !== 'Bald' ? hair : undefined}
                facialHair={facialHair !== 'None' ? facialHair : undefined}
                backgroundColor={bgColor}
                viewBox={{ x: '-50', y: '-50', width: '1050', height: '1050' }}
              />
            </div>

            <Button
              variant="outline"
              className="mt-8 gap-2 rounded-full w-40"
              onClick={randomize}
            >
              <RefreshCw className="w-4 h-4" />
              Randomize
            </Button>
          </div>

          {/* Controls Area */}
          <div className="w-full md:w-7/12 flex flex-col flex-1 overflow-hidden">
            <Tabs defaultValue="face" className="flex-1 flex flex-col">
              <div className="px-4 pt-4 pb-2 border-b">
                <TabsList className="grid grid-cols-4 w-full h-auto p-1">
                  <TabsTrigger value="face" className="text-xs py-2">Face</TabsTrigger>
                  <TabsTrigger value="hair" className="text-xs py-2">Hair</TabsTrigger>
                  <TabsTrigger value="acc" className="text-xs py-2">Extras</TabsTrigger>
                  <TabsTrigger value="bg" className="text-xs py-2">Color</TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 p-4">
                <TabsContent value="face" className="m-0 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Expression</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {faces.map((f) => (
                        <button
                          key={f}
                          onClick={() => setFace(f)}
                          className={`p-2 border rounded-lg text-xs hover:border-primary transition-colors flex flex-col items-center justify-center gap-1 aspect-square ${face === f ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border bg-card'}`}
                        >
                          <div className="w-8 h-8 relative overflow-hidden rounded-full bg-muted">
                            <Peep style={{ width: '200%', height: '200%', transform: 'translate(-25%, -25%)' }} face={f} body="Bust" />
                          </div>
                          <span className="truncate w-full text-center">{f.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="hair" className="m-0 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Hair Style</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {hairs.map((h) => (
                        <button
                          key={h}
                          onClick={() => setHair(h)}
                          className={`p-2 border rounded-lg text-xs hover:border-primary transition-colors flex flex-col items-center justify-center gap-1 aspect-square ${hair === h ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border bg-card'}`}
                        >
                          <span className="truncate w-full text-center">{h.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="acc" className="m-0 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Accessories</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {accessories.map((a) => (
                        <button
                          key={a}
                          onClick={() => setAccessory(a)}
                          className={`p-2 border rounded-lg text-xs hover:border-primary transition-colors flex flex-col items-center justify-center gap-1 aspect-square ${accessory === a ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border bg-card'}`}
                        >
                          <span className="truncate w-full text-center">{a === 'None' ? 'None' : a.replace('Glass', '')}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Facial Hair</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {facialHairs.map((f) => (
                        <button
                          key={f}
                          onClick={() => setFacialHair(f)}
                          className={`p-2 border rounded-lg text-xs hover:border-primary transition-colors flex flex-col items-center justify-center gap-1 aspect-square ${facialHair === f ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border bg-card'}`}
                        >
                          <span className="truncate w-full text-center">{f}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="bg" className="m-0 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Background Color</h4>
                    <div className="grid grid-cols-5 gap-3">
                      {backgrounds.map((bg) => (
                        <button
                          key={bg}
                          onClick={() => setBgColor(bg)}
                          className={`w-full aspect-square rounded-full shadow-sm hover:scale-110 transition-transform ${bgColor === bg ? 'ring-4 ring-primary ring-offset-2 dark:ring-offset-background' : 'ring-1 ring-border'}`}
                          style={{ background: bg }}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-muted/20 sm:justify-between items-center flex-row">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isGenerating} className="gap-2 px-8">
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Avatar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}