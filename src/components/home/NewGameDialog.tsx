import { useState, useEffect } from 'react';
import type { Player } from '../../types/game';
import type { Preset } from '../../types/preset';
import { Modal } from '../layout/Modal';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { PlayerSetup } from './PlayerSetup';
import { PresetPicker } from './PresetPicker';
import { loadSavedPresets } from '../../services/storage';

interface NewGameDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, players: Omit<Player, 'id' | 'order'>[], preset: Preset | null) => void;
  initialPlayers?: Omit<Player, 'id' | 'order'>[];
  initialPreset?: Preset | null;
}

export function NewGameDialog({ open, onClose, onCreate, initialPlayers, initialPreset }: NewGameDialogProps) {
  const [name, setName] = useState('');
  const [players, setPlayers] = useState<Omit<Player, 'id' | 'order'>[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const savedPresets = loadSavedPresets();

  useEffect(() => {
    if (!open) return;
    if (initialPlayers?.length) setPlayers(initialPlayers);
    if (initialPreset !== undefined) setSelectedPreset(initialPreset ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleCreate = () => {
    const gameName = name.trim() || 'New Game';
    let preset = selectedPreset;

    onCreate(gameName, players, preset);
    setName('');
    setPlayers([]);
    setSelectedPreset(null);
    onClose();
  };

  const canCreate = players.length >= 1;

  return (
    <Modal open={open} onClose={onClose} title="New Game">
      <div className="space-y-5">
        <Input
          label="Game Name"
          placeholder="e.g. Friday Night Catan"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <PresetPicker
          savedPresets={savedPresets}
          selected={selectedPreset}
          onSelect={(preset) => {
            setSelectedPreset(preset);
            if (preset && !name.trim()) {
              setName(preset.name);
            }
          }}
        />

        <PlayerSetup players={players} onChange={setPlayers} />

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate} className="flex-1">
            Start Game
          </Button>
        </div>
      </div>
    </Modal>
  );
}
