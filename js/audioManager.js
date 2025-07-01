// オーディオ管理クラス
export class AudioManager {
    constructor() {
        this.bgmVolume = 0.5; // 50%
        this.seVolume = 0.7;  // 70%
        
        this.initializeBGMElements();
        this.initializeSEElements();
        this.setupVolumeControls();
    }
    
    initializeBGMElements() {
        this.titleBgm = document.getElementById('title-bgm');
        this.bgm = document.getElementById('game-bgm');
        this.bgm2 = document.getElementById('game-bgm-2');
        this.naochanBgm = document.getElementById('naochan-bgm');
        this.battleBgm = document.getElementById('battle-bgm');
        
        this.currentBgm = null;
        this.bgmSwitched = false;
        
        if (this.titleBgm && this.bgm && this.bgm2 && this.naochanBgm && this.battleBgm) {
            this.updateBgmVolume();
        } else {
            console.error('❌ Audio要素が見つかりません');
        }
    }
    
    initializeSEElements() {
        this.gameStartSE = document.getElementById('se-gamestart');
        this.chain2SE = document.getElementById('se-chain2');
        this.chain3SE = document.getElementById('se-chain3');
        this.chain4SE = document.getElementById('se-chain4');
        this.moveSE = document.getElementById('se-move');
        this.rotateSE = document.getElementById('se-rotate');
        this.clearSE = document.getElementById('se-clear');
        this.naochanTimeSE = document.getElementById('se-naochan-time');
        
        this.updateSeVolume();
    }
    
    setupVolumeControls() {
        const bgmSlider = document.getElementById('bgm-volume');
        const seSlider = document.getElementById('se-volume');
        const bgmDisplay = document.getElementById('bgm-volume-display');
        const seDisplay = document.getElementById('se-volume-display');
        
        if (bgmSlider && bgmDisplay) {
            bgmSlider.addEventListener('input', (e) => {
                this.bgmVolume = e.target.value / 100;
                bgmDisplay.textContent = `${e.target.value}%`;
                this.updateBgmVolume();
            });
        }
        
        if (seSlider && seDisplay) {
            seSlider.addEventListener('input', (e) => {
                this.seVolume = e.target.value / 100;
                seDisplay.textContent = `${e.target.value}%`;
                this.updateSeVolume();
            });
        }
    }
    
    updateBgmVolume() {
        if (this.titleBgm) this.titleBgm.volume = this.bgmVolume;
        if (this.bgm) this.bgm.volume = this.bgmVolume;
        if (this.bgm2) this.bgm2.volume = this.bgmVolume;
        if (this.naochanBgm) this.naochanBgm.volume = this.bgmVolume;
        if (this.battleBgm) this.battleBgm.volume = this.bgmVolume;
    }
    
    updateSeVolume() {
        const seElements = [
            this.gameStartSE, this.chain2SE, this.chain3SE, this.chain4SE,
            this.moveSE, this.rotateSE, this.clearSE, this.naochanTimeSE
        ];
        
        seElements.forEach(se => {
            if (se) se.volume = this.seVolume;
        });
        
        console.log(`🔊 SE音量を ${Math.round(this.seVolume * 100)}% に設定しました`);
    }
    
    playSE(seElement, seName) {
        if (seElement) {
            seElement.currentTime = 0;
            seElement.volume = this.seVolume;
            seElement.play().catch(e => {
                console.log(`${seName} SE再生に失敗:`, e.message);
            });
            console.log(`🔊 ${seName} SE再生 (音量: ${Math.round(this.seVolume * 100)}%)`);
        } else {
            console.log(`❌ ${seName} SE要素が見つかりません`);
        }
    }
    
    startTitleBgm() {
        if (this.titleBgm) {
            this.titleBgm.play().catch(e => {
                console.log('タイトルBGM auto-play blocked:', e);
            });
            this.currentBgm = this.titleBgm;
            console.log('🎵 タイトルBGM開始');
        }
    }
    
    startGameBgm() {
        if (this.titleBgm) {
            this.titleBgm.pause();
            this.titleBgm.currentTime = 0;
        }
        
        if (this.bgm) {
            this.bgm.play().catch(e => {
                console.log('BGM auto-play blocked:', e);
            });
            this.currentBgm = this.bgm;
            console.log('🎵 ゲームBGM開始');
        }
    }
    
    async switchBgm(newBgm, targetVolume = 0.5) {
        console.log('🎵 BGM切り替え開始');
        
        if (this.currentBgm && !this.currentBgm.paused) {
            await this.fadeOutBgm(this.currentBgm);
        }
        
        this.currentBgm = newBgm;
        await this.fadeInBgm(newBgm, targetVolume);
        
        console.log('🎵 BGM切り替え完了');
    }
    
    fadeOutBgm(bgmElement, duration = 2000) {
        return new Promise((resolve) => {
            if (!bgmElement || bgmElement.paused) {
                resolve();
                return;
            }
            
            const startVolume = bgmElement.volume;
            const fadeStep = startVolume / (duration / 50);
            
            const fadeInterval = setInterval(() => {
                if (bgmElement.volume > fadeStep) {
                    bgmElement.volume -= fadeStep;
                } else {
                    bgmElement.volume = 0;
                    bgmElement.pause();
                    clearInterval(fadeInterval);
                    resolve();
                }
            }, 50);
        });
    }
    
    fadeInBgm(bgmElement, targetVolume = 0.5, duration = 2000) {
        return new Promise((resolve) => {
            if (!bgmElement) {
                resolve();
                return;
            }
            
            bgmElement.volume = 0;
            bgmElement.play().catch(e => console.log('BGM再生エラー:', e));
            
            const fadeStep = targetVolume / (duration / 50);
            
            const fadeInterval = setInterval(() => {
                if (bgmElement.volume < targetVolume - fadeStep) {
                    bgmElement.volume += fadeStep;
                } else {
                    bgmElement.volume = targetVolume;
                    clearInterval(fadeInterval);
                    resolve();
                }
            }, 50);
        });
    }
    
    pauseCurrentBgm() {
        if (this.currentBgm) {
            this.currentBgm.pause();
        }
    }
    
    resumeCurrentBgm() {
        if (this.currentBgm) {
            this.currentBgm.play().catch(e => {
                console.log('BGM resume failed:', e);
            });
        }
    }
    
    // 対戦モード専用BGM開始
    startBattleBgm() {
        console.log('🎵 対戦モードBGM開始');
        
        // 現在のBGMを停止
        if (this.currentBgm) {
            this.currentBgm.pause();
            this.currentBgm.currentTime = 0;
        }
        
        // 対戦BGMを開始
        if (this.battleBgm) {
            this.battleBgm.currentTime = 0;
            this.battleBgm.volume = this.bgmVolume;
            this.battleBgm.play().catch(e => {
                console.error('❌ 対戦モードBGM再生に失敗:', e);
                // autoplay制限対策として少し遅延してリトライ
                setTimeout(() => {
                    this.battleBgm.play().catch(e => {
                        console.error('❌ 対戦モードBGM再生リトライも失敗:', e);
                    });
                }, 500);
            });
            this.currentBgm = this.battleBgm;
            console.log('🎵 対戦モードBGM開始完了');
        } else {
            console.error('❌ battle-bgm要素が見つかりません');
        }
    }
    
    // 全BGM停止
    stopAllBgm() {
        const bgmElements = [
            this.titleBgm, this.bgm, this.bgm2, this.naochanBgm, this.battleBgm
        ];
        
        bgmElements.forEach(bgm => {
            if (bgm) {
                bgm.pause();
                bgm.currentTime = 0;
            }
        });
        
        this.currentBgm = null;
        console.log('🔇 全てのBGMを停止しました');
    }
}