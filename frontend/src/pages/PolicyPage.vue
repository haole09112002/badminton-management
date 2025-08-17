<template>
    <div class="policy-container">
        <div class="d-flex justify-center align-center">
            <v-card class="policy-card" elevation="6">
                <v-card-title class="text-blue font-weight-bold text-h5 text-center mb-2">
                    <v-icon color="primary" size="28" class="mr-2">mdi-shield-check</v-icon>
                    <span class="policy-title-text">
                        🎯 LUẬT CHƠI VÀ LUẬT TIỀN – CLB DTOne Badminton 🎯<br />
                        <span class="text-caption font-italic">aka: Đánh cầu cho khoẻ, đừng đánh nhau vì tiền cầu
                            😆</span>
                    </span>
                </v-card-title>
                <v-card-text>
                    <div class="mb-4 text-body-1">
                        <hr class="mb-4" />
                        <ul class="policy-list">
                            <li>
                                <span class="font-weight-bold text-blue">🏸 Tần suất đánh đấm:</span>
                                <ul>
                                    <li>Tuần 2 buổi, không thiếu không thừa.</li>
                                    <li>
                                        Buổi 1: Linh hoạt như crush của bạn – chọn 1 trong 3 ngày:
                                        <b>Thứ 4 / Thứ 5 / Thứ 6</b>, tuỳ tuần, tuỳ rảnh.
                                    </li>
                                    <li>
                                        Buổi 2: Cố định như người yêu cũ chưa quên – <b>Chủ nhật, 17h</b>,
                                        không ai được lỡ hẹn 😤
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <span class="font-weight-bold text-blue">📍 Địa điểm yêu thương:</span>
                                <ul>
                                    <li>
                                        Sân cố định: <b>Sân Kinh Sport(Sân 1)</b> – đâu đó đường Tôn Thất
                                        Dương Kỵ, đánh nhiều sẽ nhớ số nhà 😝
                                    </li>
                                    <li>
                                        Sân vãng lai: Tuần nào đặt tuần đó báo (Arena.02, Pinpon, Auora) 😝
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <span class="font-weight-bold text-blue">💸 Hội phí hàng tháng:</span>
                                <ul>
                                    <li>
                                        Dao động <b>350k – 450k</b> tuỳ phong độ tháng đó đánh bao nhiêu
                                        buổi.
                                    </li>
                                    <li>
                                        Cầu thì tụi mình “đập cho sướng”, đã bao gồm trong tiền tháng.
                                    </li>
                                    <li>
                                        Thời gian chuyển khoản: <b>từ 20 đến 25 hàng tháng</b>, nhớ lịch để
                                        khỏi bị nhắc nhở kiểu “ê tiền đâu?” 💅
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <span class="font-weight-bold text-blue">⛔️ Vắng mặt thì sao?</span>
                                <ul>
                                    <li>
                                        Báo trước 1 tuần: Không sao, không trừ tiền sân, chỉ hơi nhớ bạn tí
                                        thôi 🥲
                                    </li>
                                    <li>
                                        Báo trễ sát giờ:
                                        <ul>
                                            <li>Nếu kiếm được người thay: Oke, bạn vẫn trắng án ✌️</li>
                                            <li>
                                                Không kiếm được ai: Xin lỗi, sân vẫn trừ tiền – luật là luật,
                                                nhưng không bắt trả tiền cầu.
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <span class="font-weight-bold text-blue">👫 Số lượng team:</span>
                                <ul>
                                    <li>Mặc định <b>6 người</b>, đủ đánh xoay tua đỡ mệt.</li>
                                    <li>
                                        Rủ thêm gái xinh, gái ngoan thì mở rộng max <b>8 người</b> – miễn là
                                        không ai bị ngồi chơi xơi nước lâu quá 😘
                                    </li>
                                </ul>
                            </li>
                        </ul>
                        <hr class="my-4" />
                        <div class="text-caption text-grey-darken-1 font-italic">
                            📝 Lưu ý cuối cùng:<br />
                            CLB là nơi thể thao là chính, xả stress là phụ, chém gió là không thể
                            thiếu.<br />
                            Ai chơi vui vẻ, hoà đồng, đúng giờ, đúng tiền là auto được yêu thương
                            🫶
                        </div>
                    </div>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.policy-container {
    height: 100%;
    width: 100%;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 16px;
    box-sizing: border-box;
    background: linear-gradient(120deg, #e3f2fd 60%, #fff 100%);
    padding: 32px;
}

.policy-card {
    width: 1000px;
    max-width: 98vw;
    border-radius: 22px;
    box-shadow: 0 6px 32px 0 rgba(25, 118, 210, 0.1);
    padding: 28px 24px 22px 24px;
    background: #fff;
}

.text-blue {
    color: #1976d2 !important;
}

.policy-title-text {
    display: inline-block;
    white-space: normal;
    word-break: break-word;
    line-height: 1.3;
    text-align: center;
    max-width: 90%;
}

.text-h5.text-center {
    white-space: normal !important;
    word-break: break-word;
    line-height: 1.3;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 8px;
}

.policy-list {
    padding-left: 1.2em;

    li {
        margin-bottom: 12px;

        ul {
            margin-top: 4px;
            margin-bottom: 4px;
            padding-left: 1.2em;

            li {
                margin-bottom: 2px;
                font-weight: 400;
            }
        }
    }
}

@media (max-width: 600px) {
    .policy-card {
        width: 98vw;
        min-width: 0;
        padding: 14px 4px 10px 4px;
        border-radius: 0;
        box-shadow: none;
    }

    .policy-title-text {
        max-width: 100%;
        font-size: 1.1rem;
    }
}
</style>