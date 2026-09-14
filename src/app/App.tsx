import { StoreProvider } from '../state/store';
import { AppShell } from './AppShell';
import { RouterProvider } from './router';

export function App() {
    return (
        <StoreProvider>
            <RouterProvider>
                <AppShell />
            </RouterProvider>
        </StoreProvider>
    );
}
