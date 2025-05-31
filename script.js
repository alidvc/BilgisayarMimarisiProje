function runSimulation() {
    const input = document.getElementById("dataInput").value.trim();
    const inject = document.getElementById("injectError").checked;
  
    if (!/^[01]+$/.test(input) || ![8, 16, 32].includes(input.length)) {
      alert("Lütfen sadece 8, 16 veya 32 bitlik ikili veri girin (örn. 10101010).");
      return;
    }
  
    const dataBits = input.split('').map(Number);
    const m = dataBits.length;
  
    // Parity bit sayısını hesapla (p + m + 1 <= 2^p)
    let p = 0;
    while ((1 << p) < m + p + 1) p++;
  
    const totalBits = m + p + 1; // +1 for overall parity
    const hamming = Array(totalBits).fill(0);
  
    // Veri bitlerini uygun yerlere yerleştir
    let dataIndex = 0;
    for (let i = 1; i <= totalBits - 1; i++) {
      if (!isPowerOfTwo(i)) {
        hamming[i - 1] = dataBits[dataIndex++];
      }
    }
  
    // Parity bitlerini hesapla
    for (let i = 0; i < p; i++) {
      let parityPos = 1 << i;
      let parity = 0;
      for (let j = 1; j <= totalBits - 1; j++) {
        if ((j & parityPos) && j !== parityPos) {
          parity ^= hamming[j - 1];
        }
      }
      hamming[parityPos - 1] = parity;
    }
  
    // Genel parity (tüm bitlerin XOR'u)
    hamming[totalBits - 1] = hamming.slice(0, totalBits - 1).reduce((a, b) => a ^ b, 0);
  
    const original = [...hamming];
    let faulty = [...hamming];
  
    // Rastgele hata tanıtımı
    let errorPos = null;
    if (inject) {
      errorPos = Math.floor(Math.random() * totalBits);
      faulty[errorPos] ^= 1;
    }
  
    // Sendrom hesapla
    let syndrome = 0;
    for (let i = 0; i < p; i++) {
      let parityPos = 1 << i;
      let parity = 0;
      for (let j = 1; j <= totalBits - 1; j++) {
        if (j & parityPos) {
          parity ^= faulty[j - 1];
        }
      }
      if (parity) syndrome |= parityPos;
    }
  
    // Genel parity kontrolü
    const overallParity = faulty.reduce((a, b) => a ^ b, 0);
  
    let corrected = [...faulty];
    let correctedBit = "Yok";
  
    if (syndrome && overallParity) {
      corrected[syndrome - 1] ^= 1;
      correctedBit = syndrome;
    } else if (syndrome && !overallParity) {
      correctedBit = "Çift hata tespit edildi, düzeltilemez!";
    }
  
    // Görsel Sonuçları Göster
    document.getElementById("originalData").textContent = original.join("");
    document.getElementById("hammingCode").textContent = original.join("");
    document.getElementById("faultyData").textContent = faulty.join("");
    document.getElementById("syndrome").textContent = syndrome;
    document.getElementById("correctedData").textContent = corrected.join("");
    document.getElementById("errorBit").textContent = correctedBit;
  }
  
  function isPowerOfTwo(n) {
    return (n & (n - 1)) === 0;
  }
  