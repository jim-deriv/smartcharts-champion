import { observer } from 'mobx-react-lite';
import { useStores } from 'src/store';
import '../../sass/components/_crosshair.scss';

// This component is now a placeholder as we're using the DerivChart crosshair instead
const Crosshair = () => {
    const { chartAdapter } = useStores();

    if (!chartAdapter.isChartLoaded) return null;

    // Return null as we're using the DerivChart crosshair
    return null;
};

export default observer(Crosshair);
