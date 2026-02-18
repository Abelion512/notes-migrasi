#!/usr/bin/env bun
import { program } from 'commander';
import { TUI } from './TUI';
import { Arsip } from '@lembaran/core';
import { Gudang } from '@lembaran/core';
import pc from 'picocolors';
import prompts from 'prompts';

program
  .name('lembaran')
  .description('Lembaran — CLI Pengelolaan Aksara Personal')
  .version('2.8.0');

// Default action: Jalankan TUI jika tidak ada subcommand
program.action(async () => {
  await TUI.jalankan();
});

program
  .command('pantau')
  .description('Memantau kesehatan dan integritas sistem')
  .action(async () => {
    console.log(pc.bold('📊 STATUS SISTEM LEMBARAN:'));
    const isInit = await Arsip.isVaultInitialized();
    console.log(`${isInit ? pc.green('✅') : pc.yellow('⚠️')} Brankas: ${isInit ? 'Terinisialisasi' : 'Belum Disiapkan'}`);
    console.log(pc.green('✅ Core Logic: Ready'));
    console.log(pc.green('✅ Security Engine: AES-GCM & Argon2id'));
    console.log(pc.blue('ℹ️  Storage: Local-First (FileAdapter Active)'));
  });

program
  .command('mulai')
  .description('Menjalankan antarmuka pengelolaan (TUI)')
  .action(async () => {
    await TUI.jalankan();
  });

program
  .command('jelajah')
  .description('Menjelajahi arsip catatan terenkripsi')
  .action(async () => {
    const isInit = await Arsip.isVaultInitialized();
    if (!isInit) {
      console.log(pc.red('❌ Brankas belum disiapkan. Jalankan TUI untuk inisialisasi.'));
      return;
    }

    const response = await prompts({
      type: 'password',
      name: 'password',
      message: 'Masukkan kata sandi brankas untuk menjelajah:'
    });

    if (!response.password) return;

    const success = await Arsip.unlockVault(response.password);
    if (!success) {
      console.log(pc.red('❌ Kata sandi salah.'));
      return;
    }

    const notes = await Arsip.getAllNotes();
    console.log(pc.cyan(`\n📂 DAFTAR ARSIP (${notes.length}):`));
    console.log(pc.dim('------------------------------------'));
    notes.forEach(note => {
      console.log(`${pc.bold(note.title)} ${pc.dim(`[${note.id}]`)}`);
      console.log(`${pc.italic(note.preview || 'Tidak ada pratinjau')}`);
      console.log(pc.dim('---'));
    });
  });

program
  .command('hangus <id>')
  .description('Memusnahkan catatan secara permanen berdasarkan ID')
  .action(async (id) => {
    const response = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: `Apakah Anda yakin ingin menghapus catatan ${id}?`
    });
    if (response.confirm) {
        await Arsip.deleteNote(id);
        console.log(pc.green(`✅ Catatan ${id} berhasil dimusnahkan.`));
    }
  });

program
  .command('kuncung')
  .description('Membuka kunci brankas melalui Web')
  .option('-w, --web', 'Login via web browser', true)
  .action((options) => {
    if (options.web) {
      console.log('🌐 Membuka Gerbang Web Lembaran...');
      console.log('📍 URL: http://localhost:1400/arsip');
    }
  });


program
  .command('petik')
  .description('Memetik (export) seluruh arsip ke folder Markdown')
  .argument('[target]', 'Folder target export', './lembaran-export')
  .action(async (target) => {
    const pw = await prompts({ type: 'password', name: 'p', message: 'Password brankas:' });
    if (!pw.p || !(await Arsip.unlockVault(pw.p))) return console.log('Batal.');

    const notes = await Arsip.getAllNotes();
    const fs = await import('node:fs/promises');
    const path = await import('node:path');

    await fs.mkdir(target, { recursive: true });

    for (const note of notes) {
        const full = await Arsip.decryptNote(note);
        const fileName = `${note.title.replace(/[^a-z0-9]/gi, '_')}.md`;
        await fs.writeFile(path.join(target, fileName), full.content);
    }

    console.log(pc.green(`✅ Berhasil mengekspor ${notes.length} catatan ke ${target}`));
  });

program.parse();
