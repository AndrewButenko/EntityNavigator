import React from 'react';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { DetailsList, IColumn, SelectionMode, Selection } from '@fluentui/react/lib/DetailsList';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { Stack } from '@fluentui/react/lib/Stack';
import { IconButton } from '@fluentui/react/lib/Button';

initializeIcons();

interface IEntity {
  logicalName: string;
  displayName: string;
}

const EntityNavigator: React.FunctionComponent = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  const [selectedEntity, setSelectedEntity] = React.useState<string | undefined>(undefined);
  const [allEntities, setEntites] = React.useState<IEntity[]>([]);
  const [filteredEntities, setFilteredEntities] = React.useState<IEntity[]>([]);
  const [entityFilter, setEntityFilter] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (!entityFilter) {
      setFilteredEntities(allEntities);
      return;
    }

    const filtered = allEntities.filter((entity) => {
      return entity.displayName.toLowerCase().includes(entityFilter.toLowerCase());
    });

    setFilteredEntities(filtered);
  }, [entityFilter, allEntities]);

  const selection = React.useState<Selection>(new Selection({
    onSelectionChanged: () => {
      setSelectedEntity(selection && selection.getSelectedCount() ? (selection.getSelection()[0] as IEntity).logicalName : undefined);
    }
  }))[0];

  const columns: IColumn[] = [
    {
      key: 'displayName',
      name: 'Display Name',
      fieldName: 'displayName',
      minWidth: 100,
      maxWidth: 200,
      isResizable: false
    }
  ];

  React.useEffect(() => {
    (async () => {
      const entitiesQuery = "/api/data/v9.0/EntityDefinitions?$filter=IsValidForAdvancedFind eq true&$select=LogicalName,DisplayName";

      const fetchResponse = await fetch(entitiesQuery);
      const responseData = await fetchResponse.json();

      const results: IEntity[] = responseData.value.map((entity: any) => {
        return {
          logicalName: entity.LogicalName,
          displayName: entity.DisplayName?.UserLocalizedLabel?.Label && entity.DisplayName?.UserLocalizedLabel?.Label !== entity.LogicalName ? `${entity.DisplayName?.UserLocalizedLabel?.Label} (${entity.LogicalName})` : entity.LogicalName
        }
      });

      results.sort((a: IEntity, b: IEntity) => {
        return ((a.displayName > b.displayName) ? 1 : (a.displayName === b.displayName ? 0 : -1));
      });

      setEntites(results);
      setIsLoaded(true);
    })();
  }, []);

  if (!isLoaded) {
    return <Spinner label="Loading..." />;
  }

  return (
    <>
      <Stack horizontal={true}>
        <SearchBox
          onChange={(_, newValue) => {
            setEntityFilter(newValue?.trim());
          }}
        />
        <IconButton
          disabled={!selectedEntity}
          iconProps={{ iconName: 'CheckMark' }}
          onClick={() => {
            //@ts-ignore
            window.top.Xrm.Navigation.navigateTo({
              pageType: 'entitylist',
              entityName: selectedEntity
            });
          }}
        />
      </Stack>
      <DetailsList
        isHeaderVisible={false}
        columns={columns}
        items={filteredEntities}
        selectionMode={SelectionMode.single}
        selection={selection}
      />
    </>);
}

export default EntityNavigator;
