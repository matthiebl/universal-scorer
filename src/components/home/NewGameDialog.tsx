import { useState } from 'react';
import type { Player } from '../../types/game';
import { Modal } from '../layout/Modal';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { PlayerSetup } from './PlayerSetup';

interface NewGameDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, players: Omit<Player, 'id' | 'order'>[]) => void;
}

export function NewGameDialog({ open, onClose, onCreate }: NewGameDialogProps) {
  const [name, setName] = useState('');
  const [players, setPlayers] = useState<Omit<Player, 'id' | 'order'>[]>([]);

  const handleCreate = () => {
    const gameName = name.trim() || 'New Game';
    onCreate(gameName, players);
    setName('');
    setPlayers([]);
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
