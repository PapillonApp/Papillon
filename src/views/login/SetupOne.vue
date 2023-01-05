<script>
    // @ts-nocheck
    import TabName from '/src/components/main/TabName.vue'
    import MainItem from '/src/components/main/MainItem.vue'

    import { MapPin, Link } from 'lucide-vue-next';

    import axios from 'axios'
    import cas_list from '/src/ent_list.json'
    import etab_list from '/src/etab_list.json'

    export default {
        name: 'LoginPage',
        components: {
            TabName,
            MainItem,
            MapPin,
            Link
        },
        data() {
            return {
                
            }
        },
    }
</script>

<template>
    <div id="loginMain">
        <div class="topNav">
            <img src="/full_logo.svg" alt="logo" id="logo">
            <a class="terms" href="https://pronote.plus/assets/terms_privacy_23112022_rev0.pdf" v-wave>Termes & conditions</a>
        </div>

        <h1>Bienvenue dans Papillon 👋</h1>
        <p class="desc">Sélectionnez une méthode de connexion à votre compte Pronote.</p>

        <div class="list group">
            <RouterLink to="/setup_2"><MainItem>
                <template #icon>
                    <MapPin />
                </template>
                <template #content>
                    <h3>Trouver mon établissement</h3>
                    <p>Trouvez simplement votre établissement avec la géolocalisation</p>
                </template>
            </MainItem></RouterLink>
            <RouterLink to="/login"><MainItem>
                <template #icon>
                    <Link />
                </template>
                <template #content>
                    <h3>Se connecter avec une URL</h3>
                    <p>Utilisez le lien de votre instance Pronote (utilisateurs avancés)</p>
                </template>
            </MainItem></RouterLink>
        </div>
    </div>
</template>

<style scoped>
    
</style>
