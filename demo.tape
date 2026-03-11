Output demo.gif

Set Shell zsh
Set Width 900
Set Height 550
Set FontSize 14
Set Padding 15
Set TypingSpeed 40ms

Type `node`
Enter
Sleep 1s

Type `const audio = await import('./dist/index.js')`
Enter
Sleep 1s

Type `// 10 audio operations available`
Enter
Sleep 300ms
Type `Object.keys(audio).filter(k => typeof audio[k] === 'function')`
Enter
Sleep 1.5s

Type `// Get audio info`
Enter
Sleep 300ms
Type `await audio.info('sample.mp3')`
Enter
Sleep 2s

Type `// Convert MP3 to WAV`
Enter
Sleep 300ms
Type `const wav = await audio.convert('sample.mp3', { format: 'wav' })`
Enter
Sleep 1s
Type "console.log('Converted:', wav)"
Enter
Sleep 1.5s

Type `.exit`
Enter
Sleep 500ms
