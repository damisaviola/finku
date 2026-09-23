'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Copy, ExternalLink, Check, Phone } from 'lucide-react';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Debt } from '@/types';
import { formatRupiah, formatTanggal } from '@/lib/utils/formatters';
import { useDompetKu } from '@/lib/store';

interface WhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
}

export function WhatsAppReminderModal({
  isOpen,
  onClose,
  debt,
}: WhatsAppReminderModalProps) {
  const { user, accounts, showToast } = useDompetKu();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (debt) {
      setPhoneNumber(debt.phone_number || '');
      const remaining = Math.max(0, debt.total_amount - debt.paid_amount);
      const acc = accounts.find((a) => a.id === debt.account_id);
      const accountDesc = acc ? `${acc.name} (${acc.type})` : 'rekening kami';
      const myName = user?.name || 'saya';

      const dueDateText = debt.due_date
        ? `yang jatuh tempo pada ${formatTanggal(debt.due_date)}`
        : 'yang telah disepakati sebelumnya';

      const defaultMsg = `Halo ${debt.person_name}, semoga harimu menyenangkan! 😊

Sekadar mengingatkan terkait pinjaman sebesar ${formatRupiah(debt.total_amount)} (sisa tagihan ${formatRupiah(remaining)}) ${dueDateText}.

Bila sudah ada kelonggaran dana, pelunasan dapat ditransfer ke ${accountDesc}.

Terima kasih banyak atas perhatian dan kerjasamanya! 🙏
— ${myName}`;

      setMessage(defaultMsg);
      setCopied(false);
    }
  }, [debt, accounts, user, isOpen]);

  if (!debt) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      showToast('Pesan pengingat berhasil disalin!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Gagal menyalin teks ke clipboard.', 'error');
    }
  };

  const handleOpenWhatsApp = () => {
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith('8')) {
      cleanPhone = '62' + cleanPhone;
    }

    const encodedText = encodeURIComponent(message);
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Pengingat Tagihan WhatsApp"
      description={`Kirim pengingat santun kepada ${debt.person_name} untuk pelunasan piutang.`}
      icon={<MessageSquare className="h-5 w-5" />}
      iconVariant="emerald"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Nomor WhatsApp */}
        <Input
          label="Nomor WhatsApp Peminjam"
          placeholder="Contoh: 081234567890"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          leadingIcon={<Phone className="h-4 w-4" />}
          helperText="Format 08... otomatis dikonversi ke kode negara +62"
        />

        {/* Textarea Pesan */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
            <span>Draf Pesan Pengingat Santun</span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-[11px] text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
            </button>
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={7}
            className="font-mono text-xs leading-relaxed"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Tutup
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleOpenWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            <span>Buka di WhatsApp</span>
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
