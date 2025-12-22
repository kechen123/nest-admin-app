<template>
  <el-card class="data-card" :class="{ 'data-card--hover': hover }" shadow="hover">
    <div class="data-card__content">
      <div class="data-card__icon" :style="{ backgroundColor: iconBgColor }">
        <el-icon :size="iconSize" :color="iconColor">
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="data-card__info">
        <div class="data-card__title">{{ title }}</div>
        <div class="data-card__value" :style="{ color: valueColor }">
          {{ formattedValue }}
        </div>
        <div v-if="subtitle" class="data-card__subtitle">{{ subtitle }}</div>
      </div>
    </div>
    <div v-if="$slots.footer" class="data-card__footer">
      <slot name="footer" />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatNumber } from '@/utils/format';

interface Props {
  title: string;
  value: number | string;
  icon?: any;
  iconColor?: string;
  iconBgColor?: string;
  iconSize?: number;
  valueColor?: string;
  subtitle?: string;
  hover?: boolean;
  formatNumber?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: '#fff',
  iconBgColor: '#409eff',
  iconSize: 24,
  valueColor: '#303133',
  hover: true,
  formatNumber: false,
});

const formattedValue = computed(() => {
  if (props.formatNumber && typeof props.value === 'number') {
    return formatNumber(props.value);
  }
  return props.value;
});
</script>

<style scoped lang="scss">
.data-card {
  transition: $transition-base;
  border-radius: $border-radius-large;

  &--hover:hover {
    transform: translateY(-4px);
    box-shadow: $box-shadow-light;
  }

  &__content {
    display: flex;
    align-items: center;
    gap: $spacing-lg;
  }

  &__icon {
    width: 64px;
    height: 64px;
    border-radius: $border-radius-large;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: $font-size-base;
    color: $text-secondary;
    margin-bottom: $spacing-xs;
  }

  &__value {
    font-size: 28px;
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: $spacing-xs;
  }

  &__subtitle {
    font-size: $font-size-small;
    color: $text-secondary;
  }

  &__footer {
    margin-top: $spacing-md;
    padding-top: $spacing-md;
    border-top: 1px solid $border-lighter;
  }
}
</style>
