import { useLoginBrowser } from "@/layouts/providers/LoginBrowserProvider";
import { UnivRennes1Login, useUnivRennes1Login } from "@/services/rennes1/login";
import { useAccountStore } from "@/stores/account";
import { Account, Services } from "@/stores/account/types";
import Button from "@/ui/components/Button";
import Typography from "@/ui/components/Typography";
import uuid from "@/utils/uuid/uuid";
import { set } from "date-fns";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { TextInput, View } from "react-native";

const Rennes1 = () => {
    const router = useRouter();
    const UnivRennes1Login = useUnivRennes1Login();

    const [username, setUsername] = useState("vlinise");
    const [password, setPassword] = useState("XkO1mhIzDb3Yv7");

    const login = () => {
        UnivRennes1Login.login(username, password).then((account) => {
            const store = useAccountStore.getState();

            store.addAccount(account)
            store.setLastUsedAccount(account.id)

            router.push({
                pathname: "../end/color",
                params: {
                    accountId: account.id
                }
            });
        }).catch((error) => {
            console.error("Login failed:", error);
        });
    };

    return (
        <View>
            <Typography>
                Rennes 1
            </Typography>

            <TextInput
                placeholder="Identifiant"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Se connecter" onPress={() => { login() }} />
        </View>
    );
};

export default Rennes1;
