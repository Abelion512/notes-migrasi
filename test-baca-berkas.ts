import { bacaBerkas } from './packages/web/lib/bacaBerkas';

const changelog = bacaBerkas('CHANGELOG.md');
if (changelog && changelog.includes('# Changelog')) {
    console.log('✅ CHANGELOG.md found');
} else {
    console.error('❌ CHANGELOG.md not found');
}

const docs = bacaBerkas('docs/keamanan.md');
if (docs && docs.includes('# Keamanan')) {
    console.log('✅ docs/keamanan.md found');
} else {
    console.error('❌ docs/keamanan.md not found');
}
