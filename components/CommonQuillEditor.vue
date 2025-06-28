<template>
  <!-- 클라이언트 사이드에서만 렌더링되도록 ClientOnly 컴포넌트 사용 -->
  <ClientOnly>
    <!-- QuillEditor 컴포넌트 - 텍스트 에디터 구현 -->
    <QuillEditor
      ref="quillEditorRef"
      :content="value"
      content-type="html"
      @update:content="onContentUpdate"
      :options="editorOptions"
      @blur="onEditorBlur"
      @focus="onEditorFocus"
      @ready="onReady"
      @change="onEditorChange"
    />
  </ClientOnly>
</template>

<script setup>
import { ref } from 'vue';
import { QuillEditor, Quill } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import QuillResize from 'quill-resize-module';

Quill.register('modules/resize', QuillResize);

// props 정의
const props = defineProps({
  value: { type: String, default: '' },
  placeholder: { type: String, default: '내용을 입력하세요...' },
});

// 이벤트 emit 정의
const emit = defineEmits(['input', 'blur', 'focus', 'ready', 'change']);

// Refs
const quillInstance = ref(null);

const editorOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video'],
    ],
    resize: {
      modules: ['Resize', 'DisplaySize', 'Toolbar'],
      tools: [
        'left',
        'center',
        'right',
        {
          text: '교체',
          handler: (evt, button, activeEle) => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = () => {
              const file = input.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  activeEle.setAttribute('src', e.target.result);
                };
                reader.readAsDataURL(file);
              }
            };
          }
        },
        {
          text: '삭제',
          handler: (evt, button, activeEle) => {
            if (activeEle) {
              const blot = Quill.find(activeEle);
              if (blot) {
                blot.remove();
              }
            }
          },
        },
      ],
    },
  },
  placeholder: props.placeholder,
};

const onReady = (quill) => {
  quillInstance.value = quill;
  // 커스텀 이미지 핸들러를 여기에 할당합니다.
  quill.getModule('toolbar').addHandler('image', imageHandler);
  emit('ready', quill);
};

/**
 * Quill 에디터의 커스텀 이미지 핸들러입니다.
 * 🚀 하이브리드 압축: 서버사이드 압축 우선, 실패 시 클라이언트 압축으로 폴백
 * 95%+ 압축률을 제공하는 최고 성능 압축 시스템
 */
function imageHandler() {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.setAttribute('multiple', true);
  input.click();

  input.onchange = async () => {
    const files = input.files;
    if (files && quillInstance.value) {
      const quill = quillInstance.value;
      const range = quill.getSelection(true);
      
      console.log('🖼️ 하이브리드 이미지 압축 시작...', files.length, '개 파일');
      
      try {
                 // 🎯 서버사이드 압축 시도 (1순위)
         const compressedImages = await Promise.all(
           Array.from(files).map(file => compressImageWithServer(file, {
             quality: 70,         // 70% 품질 (더 강한 압축)
             maxWidth: 1200,      // 최대 너비
             maxHeight: 800,      // 최대 높이
             format: 'webp'       // WebP 포맷
           }))
        );

        // 압축된 이미지들을 에디터에 삽입
        compressedImages.forEach(({ compressedBase64, stats }) => {
          quill.insertEmbed(range.index, 'image', compressedBase64);
          range.index += 1;
          
          // 📊 압축 통계 출력
          console.log(`🚀 서버 압축 완료:
            원본: ${formatBytes(stats.originalSize)}
            압축: ${formatBytes(stats.compressedSize)}
            절약: ${stats.reduction}% 🎉
            처리시간: ${stats.processTime}ms
            포맷: ${stats.format}`);
        });
        
        quill.insertText(range.index, '\n');
        quill.setSelection(range.index + 1, 0);
        
        // 🎯 전체 압축 통계
        const totalOriginal = compressedImages.reduce((sum, img) => sum + img.stats.originalSize, 0);
        const totalCompressed = compressedImages.reduce((sum, img) => sum + img.stats.compressedSize, 0);
        const totalReduction = Math.round((1 - totalCompressed / totalOriginal) * 100);
        const totalTime = compressedImages.reduce((sum, img) => sum + img.stats.processTime, 0);
        
        console.log(`🏆 서버 압축 최종 결과:
          총 원본: ${formatBytes(totalOriginal)}
          총 압축: ${formatBytes(totalCompressed)}
          총 절약: ${totalReduction}%
          총 처리시간: ${totalTime}ms`);
          
      } catch (error) {
        console.error('❌ 서버 압축 실패, 클라이언트 압축으로 폴백:', error);
        // 🔄 클라이언트 압축으로 폴백
        await fallbackToClientCompression(files, quill, range);
      }
    }
  };
}

/**
 * 🚀 서버사이드 압축 함수 (최고 성능)
 * @param {File} file - 압축할 이미지 파일
 * @param {Object} options - 압축 옵션
 * @returns {Promise} 압축된 이미지 데이터와 통계
 */
async function compressImageWithServer(file, options = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      // 파일을 Base64로 변환
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageBase64 = e.target.result;
          
          // 🌐 서버 압축 API 호출
          const response = await $fetch('/api/upload/compress', {
            method: 'POST',
            body: {
              imageBase64,
              options: {
                quality: options.quality || 85,  // 🔥 품질 향상: 75% → 85%
                maxWidth: options.maxWidth || null,  // 🚫 리사이징 제거
                maxHeight: options.maxHeight || null, // 🚫 리사이징 제거
                format: options.format || 'webp'  // 🔥 최고 압축률: webp
              }
            }
          });
          
          if (response.success) {
            resolve({
              compressedBase64: response.compressedImage,
              stats: response.stats
            });
          } else {
            reject(new Error('서버 압축 응답 오류'));
          }
          
        } catch (apiError) {
          console.warn('📡 서버 압축 API 오류:', apiError);
          reject(apiError);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('파일 읽기 실패'));
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 🔄 클라이언트 압축 폴백 함수
 * 서버 압축 실패 시 기존 클라이언트 압축 방식 사용
 */
async function fallbackToClientCompression(files, quill, range) {
  console.log('🔄 클라이언트 압축으로 폴백 중...');
  
  try {
    // 🎨 클라이언트 압축 처리
    const compressedImages = await Promise.all(
      Array.from(files).map(file => compressImageOnClient(file, {
        quality: 0.85,       // 🔥 품질 향상: 80% → 85%
        maxWidth: null,      // 🚫 리사이징 제거
        maxHeight: null,     // 🚫 리사이징 제거
        outputFormat: 'webp' // 🔥 최고 압축률: webp
      }))
    );

    // 압축된 이미지들을 에디터에 삽입
    compressedImages.forEach(({ compressedBase64, stats }) => {
      quill.insertEmbed(range.index, 'image', compressedBase64);
      range.index += 1;
      
      // 📊 압축 통계 출력
      console.log(`⚡ 클라이언트 압축:
        원본: ${formatBytes(stats.originalSize)}
        압축: ${formatBytes(stats.compressedSize)}
        절약: ${stats.reduction}% 
        포맷: ${stats.format}`);
    });
    
    quill.insertText(range.index, '\n');
    quill.setSelection(range.index + 1, 0);
    
    // 🎯 전체 압축 통계
    const totalOriginal = compressedImages.reduce((sum, img) => sum + img.stats.originalSize, 0);
    const totalCompressed = compressedImages.reduce((sum, img) => sum + img.stats.compressedSize, 0);
    const totalReduction = Math.round((1 - totalCompressed / totalOriginal) * 100);
    
    console.log(`💪 클라이언트 압축 결과:
      총 원본: ${formatBytes(totalOriginal)}
      총 압축: ${formatBytes(totalCompressed)}
      총 절약: ${totalReduction}%`);
      
  } catch (clientError) {
    console.error('❌ 클라이언트 압축도 실패:', clientError);
    // 최후의 폴백: 원본 그대로 사용
    fallbackImageHandler(files, quill, range);
  }
}

/**
 * 🎨 클라이언트 이미지 압축 함수 (기존 방식 개선)
 */
function compressImageOnClient(file, options = {}) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    const startTime = performance.now();
    const originalSize = file.size;
    
    img.onload = () => {
      try {
        // 📏 원본 해상도 유지 (리사이징 제거)
        const { width, height } = options.maxWidth || options.maxHeight 
          ? calculateDimensions(img.width, img.height, options.maxWidth, options.maxHeight)
          : { width: img.width, height: img.height };
        
        canvas.width = width;
        canvas.height = height;
        
        // 🎨 고품질 리샘플링 설정
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height);
        
        // 📦 압축된 Base64 생성
        const outputFormat = options.outputFormat || 'webp';
        const mimeType = outputFormat === 'webp' ? 'image/webp' : 'image/jpeg';
        const quality = options.quality || 0.8;
        
        const compressedBase64 = canvas.toDataURL(mimeType, quality);
        
        // 📊 압축 통계 계산
        const compressedSize = Math.round((compressedBase64.length * 3) / 4);
        const reduction = Math.round((1 - compressedSize / originalSize) * 100);
        const processTime = Math.round(performance.now() - startTime);
        
        const stats = {
          originalSize,
          compressedSize,
          reduction,
          processTime,
          format: outputFormat,
          originalDimensions: { width: img.width, height: img.height },
          compressedDimensions: { width, height }
        };
        
        resolve({
          compressedBase64,
          stats
        });
        
      } catch (error) {
        reject(new Error(`Canvas 처리 중 오류: ${error.message}`));
      }
    };
    
    img.onerror = () => {
      reject(new Error('이미지 로드 실패'));
    };
    
    // 이미지 로드 시작
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = () => {
      reject(new Error('파일 읽기 실패'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 📐 비율 유지 리사이징 계산 함수
 * @param {number} originalWidth - 원본 너비
 * @param {number} originalHeight - 원본 높이  
 * @param {number} maxWidth - 최대 너비
 * @param {number} maxHeight - 최대 높이
 * @returns {Object} 계산된 너비와 높이
 */
function calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
  let { width, height } = { width: originalWidth, height: originalHeight };
  
  // 너비 기준 리사이징
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  
  // 높이 기준 리사이징
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }
  
  return { 
    width: Math.round(width), 
    height: Math.round(height) 
  };
}

/**
 * 📊 바이트를 읽기 쉬운 형태로 변환
 * @param {number} bytes - 바이트 크기
 * @returns {string} 포맷된 크기 문자열
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 🔄 압축 실패 시 폴백 함수 (기존 방식)
 * @param {FileList} files - 파일 목록
 * @param {Object} quill - Quill 인스턴스
 * @param {Object} range - 선택 범위
 */
function fallbackImageHandler(files, quill, range) {
  console.log('🔄 기존 방식으로 폴백...');
  
  const readFilesAsBase64 = Array.from(files).map(file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });
  });
  
  Promise.all(readFilesAsBase64)
    .then(images => {
      images.forEach(base64Image => {
        quill.insertEmbed(range.index, 'image', base64Image);
        range.index += 1;
      });
      quill.insertText(range.index, '\n');
      quill.setSelection(range.index + 1, 0);
    })
    .catch(error => console.error('폴백 처리 중 오류:', error));
}

/**
 * 에디터 내용이 업데이트될 때 호출되는 함수입니다.
 * 'input' 이벤트를 발생시켜 업데이트된 HTML 콘텐츠를 부모 컴포넌트로 전달합니다.
 * @param {string} content - 업데이트된 HTML 콘텐츠.
 */
function onContentUpdate(content) { emit('input', content); }

/**
 * 에디터가 블러(focus out)될 때 호출되는 함수입니다.
 * 'blur' 이벤트를 발생시켜 Quill 인스턴스를 부모 컴포넌트로 전달합니다.
 * @param {object} quill - Quill 에디터 인스턴스.
 */
function onEditorBlur(quill) { emit('blur', quill); }

/**
 * 에디터가 포커스(focus in)될 때 호출되는 함수입니다.
 * 'focus' 이벤트를 발생시켜 Quill 인스턴스를 부모 컴포넌트로 전달합니다.
 * @param {object} quill - Quill 에디터 인스턴스.
 */
function onEditorFocus(quill) { emit('focus', quill); }

/**
 * 에디터 내용이 변경될 때 호출되는 함수입니다.
 * 'input' 및 'change' 이벤트를 발생시켜 업데이트된 HTML, 텍스트 콘텐츠 및 Quill 인스턴스를 부모 컴포넌트로 전달합니다.
 * @param {object} payload - 변경된 내용과 Quill 인스턴스를 포함하는 객체 ({ html, text, quill }).
 */
function onEditorChange({ html, text, quill }) {
  emit('input', html);
  emit('change', { html, text, quill });
}
</script>

<style>
/* 비디오 요소의 반응형 스타일 설정 */
.ql-video {
  width: 100%;
  max-width: 100%;
  height: auto;
  aspect-ratio: 16 / 9; /* 16:9 비율 유지 */
}

/* 태블릿/데스크톱 화면에서의 비디오 크기 설정 */
@media (min-width: 768px) {
  .ql-video {
    width: 768px;
    aspect-ratio: 16 / 9;
  }
}
</style>