<script>
    // @ts-nocheck
    import TabName from '../components/main/TabName.vue'
    import MainItem from '../components/main/MainItem.vue'
    import MainCategory from '../components/main/MainCategory.vue'

    import { RefreshCcw, LogOut, Bug, Trash2 } from 'lucide-vue-next';

    export default {
        components: {
            TabName,
            MainItem,
            MainCategory,
            RefreshCcw,
            LogOut,
            Bug,
            Trash2
        },
        methods: {
            async getApiVersion() {
                await fetch(API + '/infos')
                    .then(response => response.json())
                    .then(data => {
                        this.api_version = data.version;
                    })
            }
        },
        data() {
            this.getApiVersion()
            return {
                version : APP_VERSION,
                api_version: this.api_version
            }
        },
        mounted() {

        }
    }
</script>

<template>
    <TabName name="À propos de Papillon" logged />
    <div id="content">
        
        <div class="generique">
            <img src="/logo_shaded.svg" class="logo" alt="Logo Papillon">
            <small>Papillon v{{ version }} / Papillon-Python v{{ api_version }}</small>
        </div>

        <MainCategory title="Contributeurs"/>

        <MainItem>
            <template #icon>
                <img src="https://avatars.githubusercontent.com/u/32978709" class="avatar" alt="Avatar Contributeur">
            </template>
            <template #content>
                <h3>Vince Linise</h3>
                <small>@ecnivtwelve</small>

                <p>Créateur et développeur principal de l'application et du serveur Papillon</p>
            </template>
        </MainItem>

        <MainItem>
            <template #icon>
                <img src="https://avatars.githubusercontent.com/u/31452517" class="avatar" alt="Avatar Contributeur">
            </template>
            <template #content>
                <h3>andronedev</h3>
                <small>@andronedev</small>

                <p>Développeur de nombreuses extensions et contributeur actif du projet</p>
            </template>
        </MainItem>

        <MainItem>
            <template #icon>
                <img src="https://avatars.githubusercontent.com/u/39491773" class="avatar" alt="Avatar Contributeur">
            </template>
            <template #content>
                <h3>Luc'HACK</h3>
                <small>@lucas-luchack</small>

                <p>Contributeur principal actif du projet</p>
            </template>
        </MainItem>

        <MainItem>
            <template #icon>
                <img src="https://avatars.githubusercontent.com/u/68423470" class="avatar" alt="Avatar Contributeur">
            </template>
            <template #content>
                <h3>Tryon</h3>
                <small>@tryon-dev</small>

                <p>Maintainer principal de l'architecture serveur du projet Papillon</p>
            </template>
        </MainItem>

        <MainItem>
            <template #icon>
                <img src="https://avatars.githubusercontent.com/u/76118368" class="avatar" alt="Avatar Contributeur">
            </template>
            <template #content>
                <h3>Astrow</h3>
                <small>@Astrow25</small>

                <p>Contributeur principal actif du projet</p>
            </template>
        </MainItem>

        <MainCategory title="Projets open-source"/>

        <MainItem>
            <template #icon>
                <img src="https://avatars.githubusercontent.com/u/31798786" class="avatar" alt="Avatar Projet OSS">
            </template>
            <template #content>
                <h3>Bain3 pour PronotePy</h3>
                <small>bain3/pronotepy</small>

                <p>API Python compatible Pronote 2022/2023 (Version actuelle de notre Api)</p>
            </template>
        </MainItem>

        <MainItem>
            <template #icon>
                <img src="https://avatars.githubusercontent.com/u/8712146" class="avatar" alt="Avatar Projet OSS">
            </template>
            <template #content>
                <h3>Litarvan pour pronote-api</h3>
                <small>Litarvan/pronote-api</small>

                <p>(Tout langage) API compatible Pronote 2020/2021 [DEPRECATED]</p>
            </template>
        </MainItem>

    </div>
</template>

<style scoped>
    .avatar {
        width: 42px;
        height: 42px;
        object-fit: cover;
        border-radius: 50%;
    }

    .generique {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: 20px;
    }

    .generique * {
        text-transform: none;
    }

    .logo {
        height: 42px;
    }

    .generique small {
        margin-top: 5px;
        font-size: 14px;
        color: #999;
    }
</style>
