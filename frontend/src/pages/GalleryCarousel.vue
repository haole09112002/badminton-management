<!-- filepath: d:\Java\badminton\badminton-management\frontend\src\components\GalleryCarousel.vue -->
<template>
    <v-card class="gallery-card scroll-container" elevation="8">
        <v-card-title class="gallery-title text-blue font-weight-bold text-h6 mb-2">
            <v-icon color="primary" class="mr-2">mdi-image-multiple</v-icon>
            Khoảnh khắc cầu lông
        </v-card-title>
        <v-carousel hide-delimiter-background height="340" show-arrows="hover" cycle interval="3500"
            class="gallery-carousel">
            <v-carousel-item v-for="(img, idx) in images" :key="idx">
                <div class="img-wrap">
                    <v-img :src="img" class="gallery-img" cover height="340">
                        <template #placeholder>
                            <div class="img-placeholder d-flex align-center justify-center">
                                <v-progress-circular indeterminate color="primary" />
                            </div>
                        </template>
                    </v-img>
                    <div class="img-index">
                        {{ idx + 1 }} / {{ images.length }}
                    </div>
                </div>
            </v-carousel-item>
        </v-carousel>
    </v-card>
</template>

<script setup lang="ts">
const images = [
    // Thay các link này bằng link ảnh thật của nhóm bạn
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTWL41BMSmTbu1hgHoClNJYwj4PAksaRzbhA&s',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80',
];
</script>

<style lang="scss" scoped>
.scroll-container {
    height: 100%;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    box-sizing: border-box;
}

.gallery-card {
    border-radius: 24px;
    background: linear-gradient(120deg, #e3f2fd 60%, #fff 100%);
    box-shadow: 0 8px 32px 0 rgba(25, 118, 210, 0.13);
    margin-bottom: 36px;
    max-width: 900px; // Giới hạn chiều ngang tối đa
    margin-left: auto;
    margin-right: auto;
    padding-bottom: 8px;
}

.gallery-title {
    letter-spacing: 0.5px;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    gap: 8px;
}

.gallery-carousel {
    border-radius: 18px;
    overflow: hidden;
    margin: 0 8px 8px 8px;
}

.img-wrap {
    position: relative;
    width: 100%;
    height: 340px;
    overflow: hidden;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.gallery-img {
    object-fit: contain;
    width: 100%;
    height: 340px;
    border-radius: 18px;
    transition: transform 0.25s;
    cursor: pointer;
    background: #e3f2fd;
}

.img-index {
    position: absolute;
    bottom: 14px;
    right: 18px;
    background: rgba(25, 118, 210, 0.85);
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    padding: 4px 14px;
    border-radius: 16px;
    box-shadow: 0 2px 8px 0 rgba(25, 118, 210, 0.10);
    letter-spacing: 0.5px;
    user-select: none;
}

.img-placeholder {
    width: 100%;
    height: 340px;
    background: #e3f2fd;
}

@media (max-width: 900px) {
    .gallery-card {
        max-width: 98vw;
        border-radius: 12px;
        margin-bottom: 18px;
    }

    .gallery-carousel,
    .img-wrap,
    .gallery-img {
        border-radius: 10px;
        height: 200px;
        min-height: 200px;
        max-height: 200px;
    }

    .img-placeholder {
        height: 200px;
    }
}

@media (max-width: 600px) {
    .gallery-card {
        max-width: 100vw;
        border-radius: 0;
        margin-bottom: 8px;
        padding-bottom: 0;
    }

    .gallery-carousel,
    .img-wrap,
    .gallery-img {
        border-radius: 0;
        height: 140px;
        min-height: 140px;
        max-height: 140px;
    }

    .img-placeholder {
        height: 140px;
    }

    .img-index {
        font-size: 0.92rem;
        padding: 2px 10px;
        bottom: 8px;
        right: 10px;
    }
}
</style>