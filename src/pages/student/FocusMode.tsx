import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Target, Play, Pause, RotateCcw, Volume2, VolumeX, Coffee, BookOpen } from 'lucide-react';

export default function FocusMode() {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [sessions, setSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [totalFocusTime, setTotalFocusTime] = useState(0);

  const focusDuration = 25 * 60;
  const breakDuration = 5 * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (mode === 'focus') {
              setSessions(s => s + 1);
              setTotalFocusTime(t => t + focusDuration);
              setMode('break');
              return breakDuration;
            } else {
              setMode('focus');
              return focusDuration;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? focusDuration : breakDuration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((mode === 'focus' ? focusDuration : breakDuration) - timeLeft) / (mode === 'focus' ? focusDuration : breakDuration) * 100;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Focus Mode</h1>
        <p className="text-muted-foreground">Deep work & Pomodoro sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{sessions}</p>
              <p className="text-sm text-muted-foreground">Sessions Today</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{Math.floor(totalFocusTime / 60)}m</p>
              <p className="text-sm text-muted-foreground">Total Focus Time</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            {soundEnabled ? <Volume2 className="w-8 h-8 text-orange-500" /> : <VolumeX className="w-8 h-8 text-muted-foreground" />}
            <div>
              <p className="text-2xl font-bold">{mode === 'focus' ? 'Focus' : 'Break'}</p>
              <p className="text-sm text-muted-foreground">Current Mode</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-8">
        <div className="text-center">
          <Badge className={`mb-4 ${mode === 'focus' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
            {mode === 'focus' ? '🎯 Focus Time' : '☕ Break Time'}
          </Badge>
          
          <div className="relative w-64 h-64 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="none" className="text-accent" />
              <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="none" 
                className={mode === 'focus' ? 'text-orange-500' : 'text-green-500'}
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={resetTimer}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button size="lg" onClick={toggleTimer}>
              {isRunning ? <><Pause className="w-5 h-5 mr-2" />Pause</> : <><Play className="w-5 h-5 mr-2" />Start</>}
            </Button>
            <Button variant="outline" onClick={() => setSoundEnabled(!soundEnabled)}>
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Focus Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Remove distractions from your workspace</li>
            <li>• Set clear goals for each session</li>
            <li>• Take regular breaks to stay fresh</li>
            <li>• Use the break time to stretch or hydrate</li>
          </ul>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Session History</h3>
          {sessions > 0 ? (
            <div className="space-y-2">
              {Array.from({ length: Math.min(sessions, 5) }).map((_, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>Session {sessions - i}</span>
                  <Badge variant="secondary">25 min</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No sessions completed yet</p>
          )}
        </Card>
      </div>
    </div>
  );
}
