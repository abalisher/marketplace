import { Theme } from "@lib/theme/config"

// Скрипт первого кадра: ставит класс темы на <html> ДО отрисовки страницы —
// иначе при системной тёмной теме успевает мигнуть светлая (SSR не знает
// prefers-color-scheme). При theme === "system" ещё и следит за сменой
// системной темы без перезагрузки.
//
// Логика зеркалит lib/theme/apply-theme.ts (импортировать модуль в инлайн-скрипт
// нельзя) — правки синхронизировать.
const script = (theme: Theme) => `(function(){try{
var t=${JSON.stringify(theme)};
var m=window.matchMedia("(prefers-color-scheme: dark)");
var apply=function(){var d=t==="dark"||(t==="system"&&m.matches);var r=document.documentElement;
r.classList.toggle("dark",d);r.dataset.mode=d?"dark":"light";r.style.colorScheme=d?"dark":"light";};
apply();
if(t==="system"&&m.addEventListener){m.addEventListener("change",apply);}
}catch(e){}})()`

const ThemeScript = ({ theme }: { theme: Theme }) => (
  <script
    id="sm-theme"
    // eslint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{ __html: script(theme) }}
  />
)

export default ThemeScript
