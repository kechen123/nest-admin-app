<template>
  <div class="editor-container">
    <!-- 此处注意写法v-model:content -->
    <QuillEditor ref="myQuillEditor" theme="snow" v-model:content="content" :options="data.editorOption"
      contentType="html" @update:content="setValue()" />
    <!-- 使用自定义图片上传 -->
    <input type="file" hidden accept=".jpg,.png" ref="fileBtn" @change="handleUpload" />
  </div>
</template>

<script lang="ts" setup>
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { reactive, onMounted, ref, toRaw, watch } from 'vue';
import { uploadApi as uploadImgApi } from '@/api/upload'

const props = defineProps<{
  modelValue: any;
  readOnly: boolean;
}>();

const emit = defineEmits(['update:modelValue']);
const content = ref('');
const myQuillEditor = ref();

// 只监听一次 通过watch监听回显
const stopWatch = watch(
  () => props.modelValue,
  (val) => {
    if (myQuillEditor.value) {
      toRaw(myQuillEditor.value).setHTML(val);
    }
    // 停止监听
    stopWatch();
  },
  { deep: true }
);
const fileBtn = ref();
const data = reactive({
  content: '',
  editorOption: {
    readOnly: props.readOnly ?? false,
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ font: [] }],
        [{ align: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ header: 1 }, { header: 2 }],
        ['image'],
        [{ direction: 'rtl' }],
        [{ color: [] }, { background: [] }],
      ],
    },
    placeholder: '请输入内容...',
  },
});
const imgHandler = (state: any) => {
  if (state) {
    fileBtn.value.click();
  }
};
// 抛出更改内容，此处避免出错直接使用文档提供的getHTML方法
const setValue = () => {
  let text = toRaw(myQuillEditor.value).getHTML();
  emit('update:modelValue', text);
};
const handleUpload = (e: any) => {
  const files = Array.prototype.slice.call(e.target.files);

  if (!files) {
    return;
  }

  uploadImgApi.uploadImage(files[0]) // 此处使用服务端提供上传接口
    .then((res) => {
      if (res.url) {
        const quill = toRaw(myQuillEditor.value).getQuill();
        const length = quill.getSelection().index;
        // 插入图片，res为服务器返回的图片链接地址
        quill.insertEmbed(length, 'image', res.url);
        // 调整光标到最后
        quill.setSelection(length + 1);
      }
    });
};
// 初始化编辑器
onMounted(() => {
  const quill = toRaw(myQuillEditor.value).getQuill();
  if (myQuillEditor.value) {
    quill.getModule('toolbar').addHandler('image', imgHandler);
  }
  toRaw(myQuillEditor.value).setHTML(props.modelValue);
});
</script>
<style scoped lang="less">
// 调整样式
.editor-container {
  height: 100%;
}

:deep(.ql-editor) {
  min-height: 180px;
  height: 100%;
}

:deep(.ql-formats) {
  height: 21px;
  line-height: 21px;
}
</style>
